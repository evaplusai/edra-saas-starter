---
title: Configuration
order: 3
slug: configuration
---

# Configuration

Edra uses environment variables for configuration. This page covers all available options.

## Environment Variables

### Core Settings

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `PORT` | No | API server port (default: 3001) |

### Stripe Billing

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook endpoint signing secret |
| `STRIPE_PRICE_ID_PRO` | No | Price ID for the Pro plan |
| `STRIPE_PRICE_ID_ENTERPRISE` | No | Price ID for the Enterprise plan |

### Email (Optional)

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | No | API key for Resend email service |
| `EMAIL_FROM` | No | Default sender address |

## Customizing Plans

Edit the pricing configuration in `src/components/pricing.tsx` to match your Stripe price IDs and plan details.

## Theme Customization

Edra uses Tailwind CSS with CSS custom properties for theming. Edit `src/styles/globals.css` to customize colors, fonts, and spacing.

## API Rate Limiting

The API includes built-in rate limiting. Configure limits in the server middleware:

```typescript
// src/server/middleware/rate-limit.ts
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
};
```
