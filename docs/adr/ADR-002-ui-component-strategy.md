# ADR-002: UI Component Strategy

**Date:** 2026-04-09
**Status:** Accepted

## Context

A SaaS template needs a consistent, themeable component library that supports both light and dark modes. The options range from fully packaged libraries (Material UI, Ant Design, Chakra) to utility-first approaches (Tailwind + headless primitives).

Packaged component libraries ship their own design language, making it difficult to achieve a custom brand identity without fighting overrides. They also add significant bundle weight and create version lock-in — upgrading the library often requires touching every component.

The Ruv project ecosystem has standardized on Tailwind CSS with shadcn/ui, which copies Radix UI primitive components directly into the project source tree. This means the project owns the component code. Theming is handled through CSS custom properties using HSL values, and next-themes provides dark/light mode switching. Lucide provides a consistent, tree-shakeable icon set.

## Decision

Use Tailwind CSS for styling, shadcn/ui (Radix primitives) for components copied into the project, Lucide for icons, and next-themes for dark/light mode toggling. Components live in `src/components/ui/` and are owned by the project, not imported from node_modules.

## Consequences

### Positive
- Full control over component markup, styling, and behavior
- No version lock-in to a third-party component library
- HSL CSS variables enable theming without Tailwind config changes
- Consistent with vibing and infinity-ui projects
- Radix primitives handle accessibility (ARIA, keyboard navigation) correctly

### Negative
- Must manually add new shadcn/ui components as needed (npx shadcn-ui add)
- Copied components require maintenance if upstream Radix fixes bugs
- Developers must understand Tailwind utility classes rather than semantic CSS

### Risks
- **Tailwind major version upgrades**: Class name changes could require bulk updates. Mitigation: use the official Tailwind upgrade tooling.
- **Radix breaking changes**: Since components are copied, upstream changes are opt-in. Mitigation: periodically review Radix changelogs for security fixes.
