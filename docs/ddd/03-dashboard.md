# Dashboard Context

## Overview

The Dashboard context aggregates activity, computes statistics, and manages notifications. It consumes domain events from Identity and Billing to provide users and admins with operational visibility.

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| ActivityLog | A timestamped record of a user action or system event |
| DailyStat | An immutable snapshot of metrics for a single day |
| Notification | A message shown to a user about an event requiring attention |
| StatsPeriod | A date range used to query aggregated statistics |

## Entities

### ActivityLog
- Fields: id, userId, action, resource, resourceId, metadata (JSON), ipAddress, createdAt
- Invariants: action must be from a known set (login, logout, create, update, delete, upgrade, payment). Logs are append-only and never modified.

### DailyStat
- Fields: id, date, totalUsers, newUsers, activeUsers, revenue, apiCalls, storageUsedMb, createdAt
- Invariants: One record per date. Once written, a DailyStat is immutable. Revenue is stored in cents.

### Notification
- Fields: id, userId, type, title, message, readAt, createdAt
- Invariants: A Notification belongs to one User. readAt is null until the user reads it. Notifications are never deleted, only marked read.

## Value Objects

### StatsPeriod
- Fields: startDate (Date), endDate (Date)
- Validation: startDate must be before endDate. Maximum range is 365 days.

### NotificationType
- Fields: value (info | warning | success | error)
- Validation: Must be one of the four allowed values.

### LogAction
- Fields: value (string)
- Validation: Must be from the allowed action set: login, logout, create, update, delete, upgrade, downgrade, payment_success, payment_failure.

## Aggregates

### DailyStat (Root: DailyStat)
- Contains: standalone, no child entities
- Invariants: Exactly one DailyStat per calendar date. Stats are calculated once at end of day (or on demand) and never modified. If recalculation is needed, the old record is replaced atomically.

## Domain Events

| Event | Trigger | Data |
|-------|---------|------|
| StatsCalculated | End-of-day job or manual trigger | date, totalUsers, newUsers, revenue |
| NotificationSent | System creates a notification for a user | userId, notificationId, type, title |
| NotificationRead | User marks notification as read | userId, notificationId, readAt |

## Repository Interfaces

### ActivityLogRepository
- create(log): ActivityLog
- findByUserId(userId, pagination): ActivityLog[]
- findByAction(action, dateRange, pagination): ActivityLog[]
- findByDateRange(startDate, endDate, pagination): ActivityLog[]
- count(filter): number

### StatsRepository
- findByDate(date): DailyStat | null
- findByRange(startDate, endDate): DailyStat[]
- upsert(stat): DailyStat
- getLatest(): DailyStat | null

### NotificationRepository
- create(notification): Notification
- findByUserId(userId, pagination): Notification[]
- findUnreadByUserId(userId): Notification[]
- markRead(id): Notification
- countUnread(userId): number

## Domain Services

### StatsService
- calculateDaily(date): Queries across Identity and Billing data to produce a DailyStat. Emits StatsCalculated.
- getStats(period): Returns DailyStat[] for the requested StatsPeriod.
- getGrowthRate(period): Computes user growth percentage over the period.

### NotificationService
- create(userId, type, title, message): Creates Notification, emits NotificationSent.
- markRead(notificationId): Sets readAt, emits NotificationRead.
- markAllRead(userId): Marks all unread notifications for the user as read.
- countUnread(userId): Returns unread notification count for badge display.
