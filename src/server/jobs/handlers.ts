import { sendEmail } from '../services/email.js';
import { welcomeEmail } from '../email-templates/welcome.js';
import { passwordResetEmail } from '../email-templates/password-reset.js';
import { subscriptionConfirmEmail } from '../email-templates/subscription-confirm.js';

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
    console.log('[job:calculate_daily_stats] Would calculate stats for:', {
      date: payload.date,
    });
    // Real stats calculation will be implemented later
  },

  async process_webhook(payload) {
    console.log('[job:process_webhook] Would process webhook:', {
      source: payload.source,
      event: payload.event,
    });
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
