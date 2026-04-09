interface WelcomeVars {
  name: string;
  verifyUrl: string;
}

export function welcomeEmail(vars: WelcomeVars): { subject: string; html: string } {
  const subject = `Welcome to our platform, ${vars.name}!`;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome, ${vars.name}!</h1>
  <p style="font-size: 16px; line-height: 1.5; color: #4a4a4a;">
    Thank you for creating an account. To get started, please verify your email address.
  </p>
  <a href="${vars.verifyUrl}"
     style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0;">
    Verify Email
  </a>
  <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">
    If you didn't create this account, you can safely ignore this email.
  </p>
</body>
</html>`;

  return { subject, html };
}
