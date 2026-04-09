# edra-saas-starter: Research & Development Plan

**Date:** 2026-04-09
**Status:** Active
**Author:** Engineering

---

## 1. Executive Summary

edra-saas-starter is a SaaS starter kit built for agentic AI applications. It ships standard SaaS infrastructure (auth, payments, dashboards) but its primary purpose is to serve as the foundation for systems where AI agents act autonomously, learn from outcomes, and coordinate with each other. Traditional SaaS starters assume human-driven CRUD workflows. Agentic applications require fundamentally different infrastructure: semantic memory via vector search, adaptive learning loops, agent coordination primitives, and real-time state management. This document defines the feature requirements that distinguish an agentic SaaS product from a conventional one, makes opinionated technical decisions, and lays out an 8-week development plan to ship a production-ready product.

---

## 2. What Makes Agentic SaaS Different

Traditional SaaS follows a simple loop: a user clicks a button, the server runs a query, and a response comes back. The application is stateless between requests. The database is a record store. The complexity lives in the UI.

Agentic SaaS inverts this. The AI agent is the primary actor, not the human. The human sets goals, monitors progress, and intervenes when needed. The agent reasons about tasks, retrieves relevant context from memory, executes multi-step plans, and improves over time based on outcomes.

This changes infrastructure requirements in four specific ways:

**Semantic memory, not just row storage.** Agents need to retrieve information by meaning, not by ID. A coding agent searching for "how we handled auth in the payments service" needs vector similarity search, not `SELECT * WHERE id = 5`. This means the database must support both relational queries and vector operations natively.

**Asynchronous execution, not request-response.** Agents run tasks that take seconds to hours. They cannot block an HTTP request. The system needs robust background job processing, status tracking, and completion callbacks.

**Agent coordination.** Multiple agents working on related tasks need shared state, conflict resolution, and the ability to hand off work. This is distributed systems territory, not CRUD territory.

**Adaptive learning.** The system must record what works, extract patterns, and apply those patterns to future tasks. This is the feedback loop that separates a useful agentic product from a chatbot with extra steps.

Standard SaaS starters address none of these. They give you a login form, a Stripe integration, and a dashboard. That is necessary but insufficient.

---

## 3. Feature Requirements for Agentic SaaS

### Foundation (must ship first)

| Feature | Traditional SaaS Need | Agentic SaaS Need |
|---------|----------------------|-------------------|
| Auth & RBAC | User login, role-based UI | API key management for agents, scoped permissions per agent type, token-based auth for service-to-service calls |
| Payments | Subscription tiers | Usage-based billing (agents consume variable compute), metered API access, cost controls per agent |
| Dashboard | User profile, settings | Agent activity monitoring, task queue visibility, cost tracking, error rates, learning metrics |

Auth is the first gate. Agents authenticate differently than humans. They need API keys with fine-grained scopes (read-only memory access, write access to specific namespaces, execution permissions). RBAC must support both human roles (admin, user) and agent roles (coder, reviewer, researcher) with independent permission sets.

Payments must handle usage-based billing. A user running 10 agents concurrently consumes more than a user running 1. Flat subscription tiers work for gating feature access, but compute and API call metering drives the real cost model.

The dashboard is the human's window into agent activity. It must show what agents are doing right now, what they completed, what failed and why, and how costs are tracking. This is closer to an observability platform than a typical user settings page.

### Agent Infrastructure

**Vector database (semantic memory).** This is the core differentiator. Agents store and retrieve knowledge by meaning. Implementation requires: embedding generation for text inputs, similarity search with configurable distance metrics, hybrid search combining vector and relational filters, and namespace isolation so agents and users do not pollute each other's memory. RuVector-Postgres handles this by extending Postgres with native vector operations, avoiding the operational overhead of running a separate vector database.

**Background jobs.** Every agent task is a background job. The system needs: reliable job queuing with retry logic, priority scheduling (urgent agent tasks jump the queue), progress tracking exposed via API, and dead letter handling for failed tasks. This is not optional or nice-to-have. Without it, agents cannot function.

**Real-time notifications.** Agents completing tasks, encountering errors, or requesting human approval must push updates instantly. WebSocket connections for the dashboard, webhook callbacks for integrations, and SSE for lightweight status streams. Polling is not acceptable for agentic workflows.

**Self-learning hooks.** The system records agent actions and outcomes, extracts patterns from successful runs, and applies those patterns to route future tasks more effectively. This is what makes the system improve over time rather than repeating the same mistakes.

### Standard SaaS (needed but not the differentiator)

These features are table stakes. They do not require novel thinking for agentic applications:

- **Landing page** -- hero, features grid, pricing table, testimonials, CTA. Use a proven template. Do not over-invest here.
- **SEO** -- meta tags, OG tags, sitemap, robots.txt, JSON-LD structured data. Standard implementation.
- **Email** -- transactional only at launch (welcome, password reset, subscription confirmation). Marketing email comes later.
- **File uploads** -- S3-compatible storage for avatars and agent artifacts. Standard presigned URL flow.
- **Cookie consent, dark mode, animations** -- legal compliance and polish. Ship last.
- **Blog/docs** -- MDX-based content. Important for SEO and onboarding but not a sprint 1 priority.

---

## 4. Development Plan

### Sprint 1 (Week 1-2): Foundation

**Deliverables:**
- React + Vite project scaffold with TypeScript strict mode
- Authentication system: email/password signup and login, Google OAuth, email verification flow, password reset, session management with JWT
- RBAC implementation: admin and user roles, protected routes, middleware for API route guards
- API key system: generate, revoke, and scope API keys for agent access
- Database schema: users, sessions, api_keys, roles tables in Postgres
- Basic layout shell: sidebar navigation, header, responsive container

**Skip for now:** Payments, landing page, SEO, email sending (stub the interfaces).

**Tech setup:** Vite dev server, Vitest for unit tests, Playwright installed but not yet scripted, ESLint + Prettier configured, Docker Compose for local Postgres.

### Sprint 2 (Week 3-4): Agent Infrastructure

**Deliverables:**
- RuVector-Postgres integration: vector extension enabled, embedding storage and retrieval API, similarity search endpoint with configurable distance metrics
- Memory namespace system: isolated vector stores per user and per agent type
- Background job processor: job queue table, worker process, retry with exponential backoff, dead letter queue, status API endpoint
- Agent task API: create task, get task status, cancel task, list tasks with filtering
- WebSocket server for real-time dashboard updates
- Webhook system for external integrations (task complete, task failed events)
- Self-learning hooks: action logging, outcome recording, basic pattern extraction

**Skip for now:** Advanced learning algorithms, multi-agent coordination protocols.

### Sprint 3 (Week 5-6): Dashboard & Monitoring

**Deliverables:**
- User dashboard: active agents view, task history with status filters, memory usage stats, cost summary
- Admin dashboard: user management table (list, search, disable), revenue analytics (MRR, churn, growth), agent activity aggregate (tasks/day, success rate, avg duration), system health indicators
- Agent detail view: task log, memory contents, performance metrics per agent
- Activity log with filtering and export
- Daily stats aggregation job
- Profile and settings pages: update email, change password, manage API keys, notification preferences

### Sprint 4 (Week 7-8): Polish & Ship

**Deliverables:**
- Stripe integration: Free/Pro/Enterprise tiers, checkout flow, customer portal, webhook handlers for subscription lifecycle, usage metering for compute costs
- Landing page: hero section, features grid (6 items), pricing table synced with Stripe, testimonials section, CTA, footer with links, fully responsive
- Transactional email: welcome email, password reset, subscription confirmation (use Resend or AWS SES)
- SEO: meta tags on all pages, OG tags, auto-generated sitemap, robots.txt, JSON-LD for landing page
- File upload: S3-compatible presigned upload for avatars
- Cookie consent banner, dark/light mode toggle
- E2E test suite: auth flows, payment flows, agent task creation, dashboard rendering
- Docker build for GCR deployment, CI pipeline
- Privacy policy and terms of service pages

---

## 5. Technical Decisions

**React + Vite over Next.js.** Agentic dashboards are SPAs, not content sites. We need fast HMR, simple client-side routing, and no SSR complexity. Vite builds are sub-second. Next.js App Router adds overhead we do not need.

**RuVector-Postgres over Prisma + Pinecone.** Running vector search inside Postgres eliminates a separate service, reduces latency (no network hop to an external vector DB), and keeps relational joins available alongside similarity queries. One database, one connection pool, one backup strategy.

**Tailwind + shadcn/ui over Material UI.** Tailwind gives full design control without fighting a component library's opinions. shadcn/ui provides accessible, unstyled primitives built on Radix that we own (copied into the project, not imported from node_modules). No version lock-in.

**SPARC methodology.** Specification, Pseudocode, Architecture, Refinement, Completion. Each feature goes through structured phases rather than ad-hoc implementation. This matters more for agentic features where the interaction model is novel and needs upfront design.

---

## 6. Risks & How to Move Fast

**Do not over-engineer the vector layer.** RuVector supports advanced features (HNSW tuning, custom distance metrics, hybrid indexes). Start with default cosine similarity and pgvector basics. Optimize only when query latency data says you must.

**Ship standard SaaS features using proven patterns.** Auth, payments, and dashboards are solved problems. Use battle-tested libraries (better-auth or lucia for auth, Stripe SDK directly, shadcn/ui for components). Do not build custom versions of things that already work.

**Add agentic capabilities incrementally.** Sprint 2 delivers the minimum agent infrastructure. Advanced features (multi-agent coordination, sophisticated learning algorithms, agent-to-agent communication) ship after the core product works and has users.

**Avoid these traps:**
- Scope creep from the vector database feature set. You need store, search, and delete. Not every indexing strategy on day one.
- Premature optimization of background jobs. Start with a simple Postgres-backed queue. Switch to Redis or a dedicated queue only if throughput demands it.
- Building what you can import. Do not write a custom OAuth flow, a custom rich text editor, or a custom charting library. Import them.
- Designing for scale before you have users. A single Postgres instance handles more than most early-stage products will ever need.

---

## 7. References

1. Anthropic. "Building Effective Agents." Anthropic Research Blog, 2025. Patterns for tool use, planning, and agent coordination in production systems.

2. LangChain Team. "LangGraph: Multi-Agent Orchestration Framework." LangChain Documentation, 2025. State machines for agent workflows, persistence, and human-in-the-loop patterns.

3. OpenAI. "Agents SDK and Agent Protocol." OpenAI Platform Documentation, 2025. Standardized agent communication protocols and tool-use patterns.

4. pgvector Contributors. "pgvector 0.8: HNSW and IVFFlat Performance Benchmarks." GitHub, 2025. Sub-millisecond vector search at million-scale within Postgres.

5. RuVector Project. "RuVector-Postgres: Unified Vector and Relational Database." RuVector Documentation, 2026. Architecture guide for embedding vector operations into Postgres for agentic workloads.

6. Bessemer Venture Partners. "State of the Cloud 2025." BVP Cloud Index, 2025. SaaS market trends, usage-based pricing adoption, and AI-native application growth.

7. Sequoia Capital. "AI Agent Infrastructure: The Next Platform Shift." Sequoia Blog, 2025. Analysis of infrastructure requirements for autonomous AI agent products.

8. SPARC Framework. "Structured Development for Agentic Systems." SPARC Documentation, 2026. Methodology specification for phase-gated development of AI-first applications.
