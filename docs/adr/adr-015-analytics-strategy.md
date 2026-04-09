# ADR-015: Analytics Strategy

**Date:** 2026-04-09
**Status:** Accepted

## Context

The template includes an admin dashboard that needs basic usage metrics: page views, referrer sources, user actions like sign-ups and subscription changes. These metrics help template users understand how their SaaS is being used from day one without configuring an external analytics service.

Third-party analytics tools (Google Analytics, Mixpanel, PostHog) add external dependencies, raise privacy concerns, and are often blocked by ad blockers. For a starter template, the right default is self-hosted and simple. Teams that need advanced analytics (funnels, cohorts, session replay, heatmaps) can add Plausible, PostHog, or any other tool later.

The implementation is an `analytics_events` table in the existing Postgres database. Events are recorded on route changes and key user actions (sign-up, login, subscription created, plan changed). A lightweight client-side hook fires events. The admin dashboard queries this table directly for charts and summaries.

## Decision

Ship built-in lightweight analytics using an `analytics_events` table in Postgres. Track page views (path, referrer, user agent, timestamp) and behavior events (event name, properties JSON, user ID if authenticated). No cookies required. No third-party scripts. Analytics data is queryable directly from the admin dashboard.

## Consequences

### Positive
- Zero external dependencies — analytics works out of the box with no service to configure
- Privacy-friendly by default — no cookies, no third-party data sharing, all data stays in your database
- First-party data collection is not blocked by ad blockers
- Admin dashboard has real data to display immediately

### Negative
- Limited feature set compared to dedicated analytics tools — no heatmaps, no session replay, no funnel visualization
- Analytics queries hit the same Postgres instance as the application, which could impact performance at scale
- No built-in data export or warehouse integration

### Risks
- High-traffic sites could generate large volumes of analytics rows — mitigated by table partitioning on timestamp and a configurable retention period with automatic cleanup
- Analytics queries on large datasets could slow down the admin dashboard — mitigated by using materialized views for dashboard aggregations, refreshed on a schedule
