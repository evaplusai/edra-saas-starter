type JobPayload = Record<string, unknown>;

type JobHandler = (payload: JobPayload) => Promise<void>;

const handlers: Record<string, JobHandler> = {
  async send_email(payload) {
    console.log('[job:send_email] Would send email:', {
      to: payload.to,
      subject: payload.subject,
    });
    // Real email sending will be implemented in Sprint 3
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
