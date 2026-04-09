# ADR-007: API Architecture

**Date:** 2026-04-09
**Status:** Accepted

## Context

The edra-saas-starter frontend is a React SPA that needs a backend API for authentication, data persistence, and business logic. The API must serve JSON to the frontend and potentially to third-party integrations.

We considered GraphQL but ruled it out for a starter template. GraphQL adds tooling complexity (schema definitions, resolvers, code generation) that is not justified when the data model is straightforward and the consumer is a single SPA we control. REST with well-defined endpoints is simpler to understand, debug, and onboard new developers onto.

The API server runs as a separate process from the Vite dev server. Route handlers live in `/src/server/routes/` to keep them colocated with the rest of the source code while maintaining a clear boundary between client and server concerns.

## Decision

Use Express.js (or Hono as a lightweight alternative) to build a REST API. Route handlers are organized in `/src/server/routes/` with one file per resource domain. All responses use JSON. Auth middleware validates JWT tokens or API keys on protected routes before the handler executes.

Key conventions:
- RESTful resource naming (`/api/users`, `/api/teams`)
- Consistent error response shape (`{ error: { code, message } }`)
- Auth middleware applied at the router level, not per-handler
- Input validation at the route boundary using Zod schemas

## Consequences

### Positive
- Simple mental model: one endpoint per operation, standard HTTP verbs
- Easy to test with any HTTP client
- Auth middleware centralizes access control logic
- Route-level Zod validation catches bad input before it reaches business logic

### Negative
- Two processes in development (Vite dev server + API server) requiring coordination
- No automatic type sharing between client and server without additional tooling
- REST can lead to over-fetching or under-fetching compared to GraphQL

### Risks
- **Route sprawl as the app grows.** Mitigation: group routes by domain, enforce naming conventions in code review.
- **Auth middleware bypass if routes are misconfigured.** Mitigation: default-deny approach where all `/api/*` routes require auth unless explicitly marked public.
