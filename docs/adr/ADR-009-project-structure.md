# ADR-009: Project Structure

**Date:** 2026-04-09
**Status:** Accepted

## Context

Project structure decisions compound over time. An overly nested structure (e.g., feature-based folders with sub-folders for components, hooks, utils, types per feature) creates navigation overhead and cognitive load for small-to-medium projects. Conversely, dumping everything into a flat `src/` directory does not scale past a handful of files.

This template follows patterns observed in Ruv's production projects (vibing, infinity-ui) which favor a pragmatic middle ground: flat where possible, nested only where a clear boundary exists. The goal is a structure that a new developer can understand in under five minutes.

## Decision

Adopt a flat component structure with minimal nesting:

```
src/
  App.tsx           # Providers + Router setup
  main.tsx          # Entry point
  pages/            # One file per route
  components/       # Flat structure + feature folders when needed
    ui/             # shadcn/ui primitives
  hooks/            # Custom React hooks
  lib/              # Utility functions
  types/            # TypeScript interfaces and type definitions
  styles/           # CSS and Tailwind configuration
  server/           # API routes + middleware
```

Rules: components go flat in `components/` until a feature accumulates 3+ related components, at which point they get a feature subfolder. Pages are always one file per route. Shared types live in `types/`, not colocated with components.

## Consequences

### Positive
- New developers orient quickly with a predictable, shallow hierarchy
- File discovery is fast without deep nesting or ambiguous feature boundaries
- Scales comfortably to approximately 50 components before reorganization is needed
- Consistent with patterns proven in Ruv's shipped projects

### Negative
- The flat `components/` directory can feel crowded beyond 30-40 files
- No enforced feature boundaries, which relies on discipline rather than structure
- Server code in `src/server/` may surprise developers expecting a separate package

### Risks
- **Organic growth without reorganization.** Mitigation: document the "3+ related components = subfolder" rule and enforce it in code review.
- **Confusion between `lib/` and `hooks/`.** Mitigation: `hooks/` is exclusively for React hooks (use* prefix), `lib/` is for pure utility functions.
