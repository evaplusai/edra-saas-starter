# Admin Context

## Overview

The Admin context provides administrative capabilities for managing users, viewing analytics, and auditing activity. It owns no entities -- it projects and queries data from Identity, Billing, Dashboard, and Content contexts.

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| Projection | A read-only view of data aggregated from other contexts |
| UserFilter | Criteria for searching and filtering the user list |
| DateRange | A start/end date pair bounding a query |
| Revenue Metric | Aggregated payment data over a time period |
| Churn Rate | The percentage of users who cancel subscriptions in a period |
| Growth Rate | The percentage increase in new users over a period |

## Entities

This context owns no entities. It reads from:
- **User** (from Identity) -- account data, roles, verification status
- **Subscription** (from Billing) -- tier, status, payment history
- **ActivityLog** (from Dashboard) -- user actions and system events
- **BlogPost, FileUpload** (from Content) -- content metrics

## Value Objects

### SearchQuery
- Fields: term (string), fields (string[])
- Validation: term must be 1-200 characters. fields must be from the allowed set (name, email, id).

### UserFilter
- Fields: role, tier, status, emailVerified, createdAfter, createdBefore
- Validation: All fields are optional. Dates must be valid. Role and tier must be from known enums.

### DateRange
- Fields: startDate (Date), endDate (Date)
- Validation: startDate must be before or equal to endDate. Maximum span is 365 days.

## Aggregates

None. Admin is a read-heavy context with no write aggregates. All mutations go through the owning context's service (e.g., disabling a user calls Identity's AuthService).

## Domain Events

Admin does not emit domain events. It consumes events from other contexts to keep projections current:

| Consumed Event | Source | Admin Action |
|---------------|--------|-------------|
| UserRegistered | Identity | Update user count projections |
| SubscriptionUpgraded | Billing | Update revenue projections |
| SubscriptionCanceled | Billing | Update churn projections |
| PaymentSucceeded | Billing | Update revenue totals |

## Repository Interfaces

Admin uses cross-context read repositories. These are query-only interfaces that join data from multiple contexts.

### AdminUserRepository (projection)
- search(query, filter, pagination): UserWithSubscription[]
- findById(id): UserWithSubscription | null
- countByRole(): Record<Role, number>
- countByTier(): Record<Tier, number>
- getRecentSignups(limit): User[]

### AdminAnalyticsRepository (projection)
- getRevenueByPeriod(dateRange): RevenueMetric[]
- getGrowthByPeriod(dateRange): GrowthMetric[]
- getChurnByPeriod(dateRange): ChurnMetric[]
- getActiveUsersByPeriod(dateRange): ActiveUserMetric[]
- getTopContent(dateRange, limit): ContentMetric[]

### AdminActivityRepository (projection)
- findFiltered(filter, pagination): ActivityLog[]
- exportCsv(filter): ReadableStream
- countByAction(dateRange): Record<LogAction, number>

## Domain Services

### AdminUserService
- listUsers(filter, pagination): Returns paginated users with subscription data joined.
- searchUsers(query): Full-text search across name and email.
- editUser(userId, fields): Delegates to Identity context to update user fields.
- disableUser(userId): Delegates to Identity context to deactivate account. Emits no events directly -- Identity emits UserDisabled.
- resetUserPassword(userId): Triggers password reset flow via Identity context.

### AdminAnalyticsService
- getRevenueDashboard(dateRange): Aggregates MRR, ARR, total revenue, and revenue by tier.
- getGrowthDashboard(dateRange): Computes signups, churn, net growth, and growth rate.
- getUsageDashboard(dateRange): Computes API calls, storage usage, and active user counts.

### AdminActivityService
- getFilteredLogs(filter, pagination): Returns activity logs matching the filter criteria.
- exportLogs(filter, format): Generates CSV or JSON export of filtered activity logs.
- getSecurityEvents(dateRange): Returns login failures, API key revocations, and password resets.
