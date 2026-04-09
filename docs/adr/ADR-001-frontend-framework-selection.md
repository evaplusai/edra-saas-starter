# ADR-001: Frontend Framework Selection

**Date:** 2026-04-09
**Status:** Accepted

## Context

The edra-saas-starter is a reusable SaaS portal template targeting dashboard-style applications. The primary use case is single-page applications with authenticated views, data tables, forms, and settings panels. There is no requirement for server-side rendering, static site generation, or SEO-optimized public pages.

Several frameworks were evaluated: Next.js, Wasp, SvelteKit, and React + Vite. Next.js adds SSR complexity and an opinionated file-based routing system that is unnecessary for dashboard SPAs. Wasp couples authentication and database concerns into the framework layer, creating lock-in. SvelteKit, while performant, has a smaller ecosystem and diverges from the established patterns used across other Ruv projects.

React 18 with Vite and TypeScript provides fast HMR during development, a minimal build configuration, and compatibility with the component libraries already in use across the project ecosystem. This stack is well-understood by the team and keeps the frontend decoupled from any backend framework.

## Decision

Use React 18 + Vite + TypeScript as the frontend framework. No SSR framework. The application is a client-side SPA that communicates with a separate API server over REST.

## Consequences

### Positive
- Sub-second HMR with Vite during development
- No framework-imposed opinions on routing, data fetching, or file structure
- Consistent with patterns used in other Ruv projects (vibing, infinity-ui)
- TypeScript provides compile-time safety without runtime overhead
- Simpler mental model — one build target, one deployment artifact

### Negative
- No server-side rendering; public marketing pages would need a separate solution
- Requires a standalone API server for backend logic
- No built-in file-based routing (must configure React Router manually)

### Risks
- **React ecosystem churn**: React 19+ may introduce breaking changes. Mitigation: pin React 18, upgrade deliberately.
- **Vite plugin compatibility**: Some older React libraries assume webpack. Mitigation: prefer modern ESM-compatible libraries.
