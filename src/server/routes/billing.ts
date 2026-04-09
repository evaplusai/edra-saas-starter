import { Router, type Request, type Response } from 'express';
import { z } from 'zod/v4';
import { query } from '../db/index.js';
import { stripe } from '../lib/stripe.js';
import { requireAuth } from '../middleware/auth.js';
import { createNotification } from '../lib/notifications.js';
import { enqueueJob } from '../lib/job-queue.js';

const router = Router();

const createCheckoutSchema = z.object({
  price_id: z.string().min(1),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

// GET /billing/subscription
router.get('/subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;

    const result = await query(
      `SELECT s.id, sp.name AS plan_name, sp.tier, s.status, s.current_period_end
       FROM subscriptions s
       JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE s.user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No subscription found' } });
      return;
    }

    res.json({ subscription: result.rows[0] });
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch subscription' } });
  }
});

// GET /billing/plans
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, stripe_price_id, tier, price, features FROM subscription_plans ORDER BY price ASC',
    );
    res.json({ plans: result.rows });
  } catch (err) {
    console.error('Get plans error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch plans' } });
  }
});

// POST /billing/create-checkout
router.post('/create-checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = createCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { price_id, success_url, cancel_url } = parsed.data;
    const userId = req.user!.sub;

    // Look up or create Stripe customer
    let stripeCustomerId: string | undefined;
    const existingSub = await query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [userId],
    );

    if (existingSub.rows.length > 0 && existingSub.rows[0].stripe_customer_id) {
      stripeCustomerId = existingSub.rows[0].stripe_customer_id as string;
    } else {
      const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }

      const customer = await stripe.customers.create({
        email: userResult.rows[0].email as string,
        metadata: { user_id: userId },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      success_url,
      cancel_url,
      metadata: { user_id: userId },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create checkout error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create checkout session' } });
  }
});

// POST /billing/create-portal
router.post('/create-portal', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;

    const result = await query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [userId],
    );

    if (result.rows.length === 0 || !result.rows[0].stripe_customer_id) {
      res.status(400).json({ error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' } });
      return;
    }

    const returnUrl = req.body.return_url ?? `${process.env.APP_URL ?? 'http://localhost:5173'}/dashboard/subscription`;

    const session = await stripe.billingPortal.sessions.create({
      customer: result.rows[0].stripe_customer_id as string,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create portal error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create portal session' } });
  }
});

// POST /billing/webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ error: { code: 'INVALID_SIGNATURE', message: 'Missing stripe signature or webhook secret' } });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        if (!userId || !stripeSubscriptionId) break;

        // Get the subscription from Stripe to find the price ID and period
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const firstItem = stripeSub.items.data[0];
        const priceId = firstItem?.price?.id;
        const periodStart = firstItem?.current_period_start;
        const periodEnd = firstItem?.current_period_end;

        // Look up plan by stripe_price_id
        const planResult = await query(
          'SELECT id FROM subscription_plans WHERE stripe_price_id = $1',
          [priceId],
        );
        const planId = planResult.rows.length > 0 ? planResult.rows[0].id : null;

        // Upsert subscription
        await query(
          `INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end)
           VALUES ($1, $2, $3, $4, 'active', to_timestamp($5), to_timestamp($6))
           ON CONFLICT (user_id) DO UPDATE SET
             plan_id = EXCLUDED.plan_id,
             stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             stripe_customer_id = EXCLUDED.stripe_customer_id,
             status = 'active',
             current_period_start = EXCLUDED.current_period_start,
             current_period_end = EXCLUDED.current_period_end,
             updated_at = now()`,
          [
            userId,
            planId,
            stripeSubscriptionId,
            stripeCustomerId,
            periodStart,
            periodEnd,
          ],
        );

        // Queue subscription confirmation email
        const userResult = await query('SELECT email, name FROM users WHERE id = $1', [userId]);
        const planInfo = planId
          ? await query('SELECT name, price FROM subscription_plans WHERE id = $1', [planId])
          : null;

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          const plan = planInfo?.rows[0];
          await enqueueJob('send_email', {
            to: user.email as string,
            template: 'subscription-confirm',
            vars: {
              name: (user.name as string) ?? (user.email as string),
              planName: (plan?.name as string) ?? 'Unknown',
              price: plan ? `$${(plan.price as number) / 100}/mo` : 'N/A',
            },
          });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const stripeSubId = subscription.id;
        const updatedItem = subscription.items.data[0];

        await query(
          `UPDATE subscriptions SET
             status = $1,
             current_period_start = to_timestamp($2),
             current_period_end = to_timestamp($3),
             updated_at = now()
           WHERE stripe_subscription_id = $4`,
          [
            subscription.status,
            updatedItem?.current_period_start,
            updatedItem?.current_period_end,
            stripeSubId,
          ],
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await query(
          `UPDATE subscriptions SET status = 'canceled', updated_at = now()
           WHERE stripe_subscription_id = $1`,
          [subscription.id],
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subDetail = invoice.parent?.subscription_details?.subscription;
        const invoiceSubId = typeof subDetail === 'string'
          ? subDetail
          : subDetail?.id ?? null;

        if (invoiceSubId) {
          // Retrieve the subscription to get updated period end
          const stripeSub = await stripe.subscriptions.retrieve(invoiceSubId);
          const periodEnd = stripeSub.items.data[0]?.current_period_end;
          await query(
            `UPDATE subscriptions SET
               current_period_end = to_timestamp($1),
               status = 'active',
               updated_at = now()
             WHERE stripe_subscription_id = $2`,
            [periodEnd, invoiceSubId],
          );
        }

        console.log('Payment succeeded for invoice:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subDetail = invoice.parent?.subscription_details?.subscription;
        const invoiceSubId = typeof subDetail === 'string'
          ? subDetail
          : subDetail?.id ?? null;

        if (invoiceSubId) {
          await query(
            `UPDATE subscriptions SET status = 'past_due', updated_at = now()
             WHERE stripe_subscription_id = $1`,
            [invoiceSubId],
          );
        }

        // Notify user about failed payment
        if (invoiceSubId) {
          const subResult = await query(
            'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
            [invoiceSubId],
          );
          if (subResult.rows.length > 0) {
            await createNotification(
              subResult.rows[0].user_id as string,
              'Payment Failed',
              'Your latest payment failed. Please update your payment method to avoid service interruption.',
              'billing',
            );
          }
        }

        console.log('Payment failed for invoice:', invoice.id);
        break;
      }

      default:
        console.log('Unhandled webhook event:', event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Webhook handler failed' } });
  }
});

export default router;
