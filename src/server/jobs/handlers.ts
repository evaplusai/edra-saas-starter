import { sendEmail } from '../services/email.js';
import { welcomeEmail } from '../email-templates/welcome.js';
import { passwordResetEmail } from '../email-templates/password-reset.js';
import { subscriptionConfirmEmail } from '../email-templates/subscription-confirm.js';
import { query } from '../db/index.js';

type JobPayload = Record<string, unknown>;

type JobHandler = (payload: JobPayload) => Promise<void>;

function renderTemplate(
  template: string,
  vars: Record<string, string>,
): { subject: string; html: string } {
  switch (template) {
    case 'welcome':
      return welcomeEmail({
        name: vars.name ?? 'there',
        verifyUrl: vars.verifyUrl ?? '',
      });
    case 'password-reset':
      return passwordResetEmail({
        name: vars.name ?? 'there',
        resetUrl: vars.resetUrl ?? '',
        expiresIn: vars.expiresIn ?? '1 hour',
      });
    case 'subscription-confirm':
      return subscriptionConfirmEmail({
        name: vars.name ?? 'there',
        planName: vars.planName ?? '',
        price: vars.price ?? '',
      });
    default:
      return { subject: String(vars.subject ?? ''), html: String(vars.html ?? '') };
  }
}

const handlers: Record<string, JobHandler> = {
  async send_email(payload) {
    const to = payload.to as string;
    const template = payload.template as string | undefined;
    const vars = (payload.vars as Record<string, string>) ?? {};

    if (template) {
      const { subject, html } = renderTemplate(template, vars);
      await sendEmail(to, subject, html);
    } else {
      const subject = payload.subject as string;
      const html = payload.html as string;
      await sendEmail(to, subject, html);
    }
  },

  async calculate_daily_stats(payload) {
    const date = (payload.date as string) ?? new Date().toISOString().split('T')[0];
    console.log('[job:calculate_daily_stats] Calculating stats for:', { date });

    const totalUsersResult = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM users',
    );
    const totalUsers = parseInt(totalUsersResult.rows[0]?.count ?? '0', 10);

    const newUsersResult = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM users WHERE created_at::date = $1',
      [date],
    );
    const newUsers = parseInt(newUsersResult.rows[0]?.count ?? '0', 10);

    const activeSubsResult = await query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM subscriptions WHERE status = 'active'",
    );
    const activeSubscriptions = parseInt(activeSubsResult.rows[0]?.count ?? '0', 10);

    const mrrResult = await query<{ total: string }>(
      `SELECT COALESCE(SUM(sp.price), 0)::text AS total
       FROM subscriptions s
       JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE s.status = 'active'`,
    );
    const mrr = parseInt(mrrResult.rows[0]?.total ?? '0', 10);

    const pageViewsResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM analytics_events
       WHERE event_type = 'page_view' AND created_at::date = $1`,
      [date],
    );
    const pageViews = parseInt(pageViewsResult.rows[0]?.count ?? '0', 10);

    await query(
      `INSERT INTO daily_stats (date, total_users, new_users, active_subscriptions, mrr, page_views)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (date) DO UPDATE SET
         total_users = EXCLUDED.total_users,
         new_users = EXCLUDED.new_users,
         active_subscriptions = EXCLUDED.active_subscriptions,
         mrr = EXCLUDED.mrr,
         page_views = EXCLUDED.page_views`,
      [date, totalUsers, newUsers, activeSubscriptions, mrr, pageViews],
    );

    console.log('[job:calculate_daily_stats] Done:', {
      date,
      totalUsers,
      newUsers,
      activeSubscriptions,
      mrr,
      pageViews,
    });
  },

  async process_webhook(payload) {
    const { event, data } = payload as { event?: string; data?: unknown };
    console.log(`[webhook] Processing deferred webhook: ${event}`, data);
    // Webhook processing is handled synchronously in billing routes.
    // This handler exists for future async webhook retries.
  },
};

export async function processJob(
  type: string,
  payload: JobPayload,
): Promise<void> {
  const handler = handlers[type];

  if (!handler) {
    console.warn(`[worker] Unknown job type: ${type}`);
    return;
  }

  await handler(payload);
}
