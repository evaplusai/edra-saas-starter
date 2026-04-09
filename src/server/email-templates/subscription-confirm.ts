interface SubscriptionConfirmVars {
  name: string;
  planName: string;
  price: string;
}

export function subscriptionConfirmEmail(vars: SubscriptionConfirmVars): { subject: string; html: string } {
  const subject = `Subscription confirmed: ${vars.planName}`;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin-bottom: 16px;">Subscription Confirmed</h1>
  <p style="font-size: 16px; line-height: 1.5; color: #4a4a4a;">
    Hi ${vars.name}, your subscription to the <strong>${vars.planName}</strong> plan is now active.
  </p>
  <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
    <p style="margin: 0; font-size: 14px; color: #6b7280;">Plan</p>
    <p style="margin: 4px 0 12px; font-size: 18px; font-weight: 600;">${vars.planName}</p>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">Price</p>
    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600;">${vars.price}</p>
  </div>
  <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">
    You can manage your subscription from the dashboard at any time.
  </p>
</body>
</html>`;

  return { subject, html };
}
