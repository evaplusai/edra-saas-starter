# ADR-010: Navigation and Routing

**Date:** 2026-04-09
**Status:** Accepted

## Context

SaaS dashboards typically have sidebar navigation with multiple pages. A common anti-pattern is defining routes in one place and sidebar menu items in another, leading to drift where a route exists but has no menu entry (or vice versa). Keeping these in sync manually is error-prone.

Ruv's established pattern solves this with a single configuration array that drives both the route definitions and the sidebar UI. Adding a new page becomes a two-step process: create the component, add an entry to the config array. No need to touch the router setup or the sidebar component separately.

## Decision

Use React Router v6 for client-side routing. Define a centralized navigation configuration array that contains route path, component reference, label, icon, and visibility flags. The sidebar component iterates this array to render menu items. The router reads the same array to register routes.

Example shape:
```typescript
{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, component: DashboardPage }
```

Nested routes and layout routes use React Router's built-in outlet pattern. Protected routes wrap with an auth guard component that redirects unauthenticated users.

## Consequences

### Positive
- Single source of truth for navigation and routing eliminates sync bugs
- Adding a page requires touching exactly two files: the new page component and the nav config
- Sidebar automatically reflects route changes with no additional work
- Easy to implement role-based menu visibility by adding a `roles` field to the config

### Negative
- Dynamic or deeply nested route structures may outgrow a flat config array
- Component lazy-loading requires wrapping config entries with `React.lazy`, adding slight complexity
- Config-driven approach is less flexible than hand-coded JSX for one-off navigation patterns

### Risks
- **Config array becomes unwieldy with 20+ entries.** Mitigation: group entries by section (e.g., main, settings, admin) within the array using separator objects.
- **Circular dependency if page components import from the nav config.** Mitigation: page components never import the nav config; data flows one direction from config to router and sidebar.
