# ADR-011: Form and Validation Strategy

**Date:** 2026-04-09
**Status:** Accepted

## Context

Every SaaS application has forms: login, registration, settings, team management, billing. Inconsistent form handling (some forms using controlled inputs, others using refs, validation scattered across components) leads to bugs and poor user experience. A standardized approach is essential.

We need runtime validation, not just TypeScript compile-time checks, because user input is inherently untrusted. The validation library should produce schemas that are reusable on both the client (form validation) and the server (API input validation) to avoid duplicating rules.

Ruv's projects consistently use React Hook Form with Zod, a combination that provides type safety, minimal re-renders, and declarative validation schemas. This is a well-established pattern in the React ecosystem with strong community support.

## Decision

Use React Hook Form for form state management and Zod for schema-based validation. Connect them via `@hookform/resolvers/zod`. Every form defines a Zod schema that serves as the single source of truth for validation rules and TypeScript types (via `z.infer<>`).

Conventions:
- Zod schemas live in `types/` or colocated with the form if single-use
- Server-side API routes reuse the same Zod schemas for input validation
- Error messages are defined in the schema, not in JSX
- Complex multi-step forms use a single schema with `.pick()` for per-step validation

## Consequences

### Positive
- Type-safe forms with validation rules derived from a single schema definition
- Zod schemas are reusable for API request validation, ensuring client and server agree
- React Hook Form minimizes re-renders compared to controlled-input approaches
- Consistent error handling patterns across all forms in the application

### Negative
- Two libraries to learn (React Hook Form + Zod) for developers unfamiliar with either
- Zod bundle size (~13KB minified+gzipped) adds to the client payload
- Complex conditional validation in Zod can be verbose (`.refine()` chains)

### Risks
- **Schema drift between client and server.** Mitigation: shared schemas imported by both client forms and API route handlers from the same `types/` directory.
- **Over-validation on simple forms.** Mitigation: use Zod only for forms with real validation needs; simple single-field inputs can use basic HTML validation.
