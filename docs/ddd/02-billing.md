# Billing Context

## Overview

The Billing context manages subscriptions, payment processing, and Stripe integration. It translates external payment provider events into domain events and enforces tier-based access rules.

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| Subscription | A user's active plan determining feature access |
| Tier | The plan level: Free, Pro, or Enterprise |
| BillingCycle | The recurring interval: monthly or yearly |
| Checkout | A Stripe-hosted payment session for upgrading |
| Portal | A Stripe-hosted page for managing payment methods |
| Webhook | An inbound HTTP call from Stripe reporting payment state changes |

## Entities

### Subscription
- Fields: id, userId, tier, status (active/canceled/past_due), stripeCustomerId, stripeSubscriptionId, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt
- Invariants: Each User has exactly one Subscription. Status transitions must follow: active -> canceled, active -> past_due -> active/canceled. Free tier has no Stripe references.

### Invoice
- Fields: id, subscriptionId, stripeInvoiceId, amountDue, amountPaid, currency, status, paidAt, createdAt
- Invariants: An Invoice belongs to exactly one Subscription. amountPaid cannot exceed amountDue.

### PaymentMethod
- Fields: id, userId, stripePaymentMethodId, type (card), last4, expiryMonth, expiryYear, isDefault
- Invariants: A User may have multiple payment methods but exactly one default.

## Value Objects

### SubscriptionTier
- Fields: name (Free | Pro | Enterprise)
- Validation: Must be one of the three allowed values. Determines feature limits (API calls, storage, seats).

### BillingCycle
- Fields: interval (monthly | yearly)
- Validation: Yearly receives a discount. Only applicable to Pro and Enterprise tiers.

### StripeCustomerId
- Fields: value (string)
- Validation: Must start with "cus_". Created once per User, immutable.

### Price
- Fields: amount (integer, cents), currency (string)
- Validation: amount >= 0. currency is a valid ISO 4217 code. Immutable.

## Aggregates

### Subscription (Root: Subscription)
- Contains: references to Invoices, PaymentMethods (via userId)
- Invariants: Cannot downgrade from Enterprise directly to Free (must go through Pro). Cancellation takes effect at period end. A past_due subscription has a 7-day grace period before cancellation.

## Domain Events

| Event | Trigger | Data |
|-------|---------|------|
| SubscriptionCreated | User registers (Free) or first checkout completes | userId, tier, subscriptionId |
| SubscriptionUpgraded | User moves to higher tier | userId, fromTier, toTier, subscriptionId |
| SubscriptionDowngraded | User moves to lower tier | userId, fromTier, toTier, effectiveAt |
| SubscriptionCanceled | User cancels or grace period expires | userId, subscriptionId, canceledAt |
| PaymentSucceeded | Stripe invoice paid | userId, invoiceId, amount, currency |
| PaymentFailed | Stripe charge fails | userId, invoiceId, failureReason |

## Repository Interfaces

### SubscriptionRepository
- findById(id): Subscription | null
- findByUserId(userId): Subscription | null
- findByStripeCustomerId(customerId): Subscription | null
- create(subscription): Subscription
- update(id, fields): Subscription
- listByStatus(status, pagination): Subscription[]

## Domain Services

### StripeService
- createCheckoutSession(userId, tier, cycle): Returns Stripe checkout URL
- createPortalSession(userId): Returns Stripe billing portal URL
- handleWebhook(event): Parses Stripe event, maps to domain event, updates Subscription

## Anti-Corruption Layer

The StripeService acts as an anti-corruption layer between the Stripe API and the domain model. It translates:

| Stripe Event | Domain Event |
|-------------|-------------|
| checkout.session.completed | SubscriptionCreated or SubscriptionUpgraded |
| invoice.paid | PaymentSucceeded |
| invoice.payment_failed | PaymentFailed |
| customer.subscription.updated | SubscriptionUpgraded or SubscriptionDowngraded |
| customer.subscription.deleted | SubscriptionCanceled |

Raw Stripe objects are never exposed beyond the StripeService. All downstream consumers work exclusively with domain types.
