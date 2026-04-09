# ADR-003: Database Selection

**Date:** 2026-04-09
**Status:** Accepted

## Context

The template needs a database for user accounts, sessions, subscriptions, and application data. Common choices include PostgreSQL, MySQL, MongoDB, and managed services like Supabase or PlanetScale. Many SaaS templates also introduce an ORM like Prisma or Drizzle to abstract the database layer.

RuVector-Postgres is a PostgreSQL-compatible database that adds vector search capabilities while behaving identically to standard Postgres for all relational operations. Using it as the sole database eliminates the need for a separate vector store if the project later requires embeddings, similarity search, or AI features. It uses one connection pool, one backup strategy, and one set of operational tooling.

ORMs add a translation layer that obscures query behavior, complicates debugging, and often generates suboptimal SQL. For a template that prioritizes transparency and developer understanding, direct SQL or a lightweight query builder (like Kysely or Knex) is preferred.

## Decision

Use RuVector-Postgres as the sole database. No ORM. Use direct SQL with parameterized queries, or a lightweight typed query builder if type safety at the query level is needed. One database instance handles all relational and vector workloads.

## Consequences

### Positive
- Single database for all data needs, including future vector/AI features
- Standard PostgreSQL compatibility means any Postgres tooling works
- No ORM abstraction layer — queries are explicit and debuggable
- One connection pool, one backup strategy, one monitoring target
- Migration files are plain SQL, portable to any Postgres instance

### Negative
- Developers must be comfortable writing SQL directly
- No auto-generated TypeScript types from schema (must maintain types manually or use codegen)
- No Prisma Studio or similar GUI for quick data inspection

### Risks
- **SQL injection**: Without an ORM's automatic parameterization, raw queries could be vulnerable. Mitigation: enforce parameterized queries via linting rules and code review.
- **Schema drift**: Without ORM migration tracking, schema versions must be managed manually. Mitigation: use a dedicated migration tool (dbmate or golang-migrate).
