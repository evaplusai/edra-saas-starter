# Context Map

## Overview

This document describes how the five bounded contexts in the edra-saas-starter portal relate to each other, their integration patterns, and the communication mechanisms between them.

## Context Map Diagram

```
                    +-----------------+
                    |     Admin       |
                    | (Read Projections|
                    |  across all)    |
                    +-------+---------+
                            |
              reads from all contexts
                            |
    +-----------+-----------+-----------+-----------+
    |           |           |           |           |
    v           v           v           v           v
+--------+  +--------+  +---------+  +---------+
|Identity|  |Billing |  |Dashboard|  | Content |
|        |<>|        |  |         |  |         |
+---+----+  +---+----+  +----+----+  +---------+
    |           |             |
    +-----------+-------------+
      Domain Events (async)
```

## Context Relationships

| Upstream | Downstream | Pattern | Shared Data |
|----------|------------|---------|-------------|
| Identity | Billing | Customer-Supplier | UserId links User to Subscription |
| Identity | Dashboard | Customer-Supplier | UserId links User to ActivityLog |
| Billing | Dashboard | Published Language | PaymentSucceeded/Failed create Notifications, feed revenue stats |
| Identity | Content | Customer-Supplier | UserId references authorship on BlogPost/FileUpload |
| All | Admin | Conformist | Admin reads from all contexts via projections |

## Integration Patterns

### Identity <-> Billing (Customer-Supplier)
When a User registers (UserRegistered event), the Billing context creates a free-tier Subscription. The Identity context owns the User aggregate; Billing references the UserId as a foreign key but never modifies User state. Billing publishes SubscriptionUpgraded/Downgraded events that Identity may consume to update feature flags.

### Identity <-> Dashboard (Customer-Supplier)
User actions in Identity (login, password reset, API key creation) emit domain events that the Dashboard context consumes to create ActivityLog entries. Dashboard never writes back to Identity.

### Billing <-> Dashboard (Published Language)
Payment domain events (PaymentSucceeded, PaymentFailed, SubscriptionCanceled) are published in a shared event schema. Dashboard consumes these to generate Notifications and update DailyStat revenue metrics.

### Content (Standalone)
Content operates independently. It references UserId for authorship but has no direct integration with other contexts. BlogPost and FileUpload aggregates are self-contained.

### Admin (Read-Only Projections)
Admin owns no entities. It queries across Identity, Billing, Dashboard, and Content through read-only repository interfaces. It projects data for search, filtering, analytics, and export. This is a pure Conformist relationship -- Admin conforms to the data models of all other contexts.

## Communication Pattern

All cross-context communication uses asynchronous domain events. No context calls another context's services directly. This ensures loose coupling and allows each context to evolve independently.

### Event Flow

1. **UserRegistered** -> Billing creates Subscription, Dashboard logs activity
2. **SubscriptionUpgraded** -> Dashboard creates Notification
3. **PaymentFailed** -> Dashboard creates urgent Notification
4. **PostPublished** -> Dashboard logs activity
5. **ApiKeyRevoked** -> Dashboard logs security activity
