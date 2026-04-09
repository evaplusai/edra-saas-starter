# ADR-004: State Management

**Date:** 2026-04-09
**Status:** Accepted

## Context

React applications need a strategy for managing client-side state. Options range from heavyweight solutions (Redux, MobX) to lightweight stores (Zustand, Jotai) to no external state library at all. The choice depends on application complexity and team conventions.

SaaS dashboards primarily display server data — user profiles, subscription status, usage metrics, settings. This is server state, not client state. The actual client-only state (form inputs, modal visibility, sidebar collapse) is local to individual components and does not need global coordination.

The Ruv project pattern across all applications is to use React's built-in useState and useReducer for local UI state, and React Query (TanStack Query) for server state. React Query handles caching, background refetching, optimistic updates, and loading/error states. This eliminates the need for a global store in the vast majority of cases.

## Decision

Use useState/useReducer for local component state and React Query for all server state. No Redux, no Zustand, no global state management library. For the narrow case of deeply nested auth/user context, use React Context with a provider at the app root.

## Consequences

### Positive
- Zero boilerplate — no actions, reducers, selectors, or store configuration
- React Query handles caching, deduplication, and background sync automatically
- Components are self-contained and independently testable
- Follows established Ruv project conventions
- Smaller bundle size with no state management library

### Negative
- Deeply nested components that need auth state must use Context or prop drilling
- No single place to inspect all application state (no Redux DevTools equivalent)
- Developers accustomed to centralized stores may find the pattern unfamiliar

### Risks
- **Prop drilling depth**: Some dashboard layouts have deep component trees. Mitigation: use React Context for auth/user data, and React Query for everything else.
- **Cache invalidation complexity**: React Query's cache can become stale if mutation invalidation is not configured correctly. Mitigation: establish clear query key conventions and invalidation patterns in project documentation.
