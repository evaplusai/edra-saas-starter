# ADR-008: Background Job Processing

**Date:** 2026-04-09
**Status:** Accepted

## Context

Several features require asynchronous processing outside the request-response cycle: computing daily usage statistics, sending transactional emails, retrying failed webhook deliveries, and running scheduled maintenance tasks. These operations are too slow or too unreliable to execute inline during an API request.

Most job queue solutions (BullMQ, Celery, Sidekiq) depend on Redis as a broker. Adding Redis introduces another service to provision, monitor, and pay for. For a starter template targeting small-to-medium workloads, this complexity is unnecessary when Postgres is already in the stack.

We evaluated pg-boss (Postgres-native job queue) and decided to implement a minimal custom solution instead, keeping the dependency footprint small and the implementation transparent to developers learning from the template.

## Decision

Use a Postgres-backed job queue. A `jobs` table stores job type, payload, status, retry count, scheduled execution time, and error details. A worker process polls for pending jobs on a configurable interval. Failed jobs retry with exponential backoff (base 2, max 5 retries). Jobs that exhaust retries move to a dead letter state for manual inspection.

Schema essentials:
- `id`, `type`, `payload` (JSONB), `status` (pending/running/completed/failed/dead)
- `run_at` (scheduled execution), `attempts`, `max_attempts`, `last_error`
- Index on `(status, run_at)` for efficient polling

## Consequences

### Positive
- Zero additional infrastructure beyond the existing Postgres database
- Job state is queryable with standard SQL, making debugging straightforward
- Transactional job creation (enqueue a job in the same transaction as the data change)
- Dead letter handling provides visibility into persistent failures

### Negative
- Lower throughput than Redis-backed queues under high load
- Polling introduces slight latency compared to push-based brokers
- Row-level locking for job claims adds minor database load

### Risks
- **Table bloat from completed jobs.** Mitigation: scheduled cleanup job that archives or deletes completed jobs older than 30 days.
- **Worker stalls leaving jobs stuck in "running" state.** Mitigation: heartbeat column with a stale-job reaper that resets jobs not updated within the timeout window.
- **Scaling ceiling.** Mitigation: document the migration path to BullMQ/Redis when throughput demands exceed what Postgres polling can handle.
