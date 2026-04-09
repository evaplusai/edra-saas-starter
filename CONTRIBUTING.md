# Contributing to Edra SaaS Starter

## How to Add a New Page

1. **Create the page component** in `src/pages/` following the existing folder structure (e.g., `src/pages/dashboard/my-page.tsx`).
2. **Add a route** in `src/App.tsx` inside the appropriate route group (public, protected, or landing).
3. **Add a nav item** in `src/components/sidebar.tsx` (for dashboard pages) or the landing nav config for public pages.

## How to Add a New API Route

1. Create a new route file in `src/server/routes/` (e.g., `src/server/routes/my-feature.ts`). Export a default Express Router.
2. Register the router in the server entry point `src/server/index.ts` by importing and mounting it with `app.use()`.

## How to Add a New Database Migration

1. Create a new SQL file in `src/server/db/migrations/` with the next sequential number prefix (e.g., `010_my_feature.sql`).
2. Write your `CREATE TABLE`, `CREATE INDEX`, and any seed `INSERT` statements.
3. Run the migration with `npm run migrate` or the project's migration script.

## How to Run Tests

```bash
# Unit / integration tests
npm test

# E2E tests (requires the dev server to be running)
npx playwright test

# Run a specific E2E test file
npx playwright test tests/e2e/auth.spec.ts

# Lint
npm run lint
```

## Code Style

- **TypeScript strict mode** is enabled. All code must be fully typed.
- **Tailwind CSS** for styling. Avoid custom CSS unless absolutely necessary.
- **shadcn/ui** components for UI primitives (`@/components/ui/`).
- Keep components **under 500 lines**. Split large components into smaller, focused pieces.
- Use **named exports** for components and **default exports** for page-level components.
- Validate all user input at system boundaries (API routes, form submissions).
- Never hardcode secrets or API keys in source files.
