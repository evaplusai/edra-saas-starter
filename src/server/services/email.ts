import { Resend } from 'resend';

export interface EmailAdapter {
  send(to: string, subject: string, html: string): Promise<void>;
}

class ResendAdapter implements EmailAdapter {
  private client: Resend;
  private from: string;

  constructor(apiKey: string, from: string) {
    this.client = new Resend(apiKey);
    this.from = from;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    await this.client.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
  }
}

class ConsoleAdapter implements EmailAdapter {
  async send(to: string, subject: string, html: string): Promise<void> {
    console.log('[email:console]', {
      to,
      subject,
      htmlLength: html.length,
      preview: html.slice(0, 200),
    });
  }
}

function createAdapter(): EmailAdapter {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'noreply@example.com';

  if (apiKey) {
    return new ResendAdapter(apiKey, from);
  }

  console.warn('[email] RESEND_API_KEY not set — using console adapter');
  return new ConsoleAdapter();
}

const adapter = createAdapter();

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  await adapter.send(to, subject, html);
}
