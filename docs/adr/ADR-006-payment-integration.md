# ADR-006: Payment Integration

**Date:** 2026-04-09
**Status:** Accepted

## Context

A SaaS template needs payment processing to support subscription billing. The main contenders are Stripe, Lemon Squeezy, and Polar. Lemon Squeezy and Polar simplify tax handling and act as merchant of record, but they have smaller ecosystems and fewer integration options. For a general-purpose template that will be forked into many different projects, the payment provider should be the most widely understood and documented option.

Stripe is the industry standard for SaaS billing. Its API is well-documented, its client libraries are mature, and its hosted checkout and customer portal reduce the amount of UI that the template needs to build. Stripe handles PCI compliance, reducing the security burden on the application.

The template defines three subscription tiers: Free (no payment required), Pro (monthly/annual billing), and Enterprise (custom pricing, typically annual). Projects that fork the template can adjust tiers, pricing, and features without changing the integration pattern.

## Decision

Use Stripe as the sole payment provider. Implement three tiers (Free, Pro, Enterprise). Use Stripe Checkout for payment collection, the Stripe Customer Portal for subscription management, and webhook handlers for event processing (payment succeeded, subscription canceled, etc.). No other payment providers at the template level.

## Consequences

### Positive
- Industry-standard integration with extensive documentation and community support
- Hosted Checkout and Customer Portal reduce frontend work significantly
- PCI compliance handled by Stripe — no credit card data touches the application
- Webhook-driven architecture decouples payment events from request/response cycles
- Three-tier model covers the most common SaaS pricing patterns

### Negative
- Stripe dependency — switching providers requires rewriting payment logic
- Stripe fees (2.9% + 30 cents per transaction) are non-negotiable at standard volume
- Must handle webhook idempotency and retry logic correctly

### Risks
- **Webhook reliability**: Stripe webhooks can be delayed or delivered out of order. Mitigation: implement idempotent webhook handlers using event IDs, and use Stripe's webhook signature verification.
- **Subscription state sync**: Local database subscription status can drift from Stripe's state. Mitigation: treat Stripe as the source of truth and reconcile via periodic polling or webhook catch-up.
