# ADR-013: Email Provider Selection

**Date:** 2026-04-09
**Status:** Accepted

## Context

The template requires transactional email for core user flows: welcome emails on registration, password reset tokens, subscription confirmations, and billing receipts. These are not marketing emails — they are triggered by user actions and must be reliable and fast.

Resend offers the best developer experience among current email providers. Its API is straightforward, it supports React Email templates (which align with our React frontend), and the free tier covers 100 emails/day — more than enough for development and early-stage projects. For teams operating in environments where third-party email services are restricted (enterprise, government, air-gapped), SMTP remains the universal fallback.

Rather than coupling the codebase to any single provider, we use an adapter pattern. The email service interface defines `send`, `sendBatch`, and `sendTemplate` methods. Each provider implements this interface. Swapping from Resend to SendGrid, SES, or Mailgun means writing one adapter file and changing an environment variable.

## Decision

Use Resend as the default email provider. Implement an SMTP adapter as a built-in fallback. Define an `EmailProvider` interface that all adapters implement. Provider selection is controlled by the `EMAIL_PROVIDER` environment variable.

## Consequences

### Positive
- Resend's API is simple — sending an email is one function call with typed parameters
- React Email templates let us build emails with the same component model as the UI
- SMTP fallback means the template works in any environment with a mail server
- Adapter pattern makes adding new providers a single-file change with no core modifications

### Negative
- Resend is a younger service compared to SendGrid or SES — smaller ecosystem and community
- Two adapters to maintain from day one (Resend + SMTP)
- SMTP adapter lacks feature parity (no built-in template rendering, no delivery analytics)

### Risks
- Resend free tier rate limits could be hit during load testing — mitigated by using SMTP adapter in CI/test environments
- Resend API changes could break the adapter — mitigated by pinning the SDK version and wrapping all calls behind the interface
