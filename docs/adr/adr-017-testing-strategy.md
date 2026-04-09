# ADR-017: Testing Strategy

**Date:** 2026-04-09
**Status:** Accepted

## Context

The template includes authentication, payments (Stripe), role-based access, and multi-step user flows. Bugs in any of these areas directly impact revenue and user trust. The testing strategy needs to provide confidence that these critical paths work without imposing a heavy maintenance burden on teams that fork the template.

Three-layer testing (unit, integration, E2E) is the standard recommendation, but for a starter template the integration layer adds complexity without proportional value. Unit tests cover pure logic (Zod schema validation, utility functions, auth token handling). E2E tests cover the real user flows (register, login, subscribe, navigate dashboard, perform admin actions). The gap between these two layers — integration tests that mock databases or test API routes in isolation — can be filled per-project when the codebase grows beyond the template's scope.

Vitest is chosen for unit tests because it is fast, compatible with the Vite build toolchain, and has native TypeScript support. Playwright is chosen for E2E tests because it supports multiple browsers, has reliable auto-waiting, and runs headless in CI without extra configuration.

## Decision

Use Vitest for unit tests and Playwright for E2E tests. No integration test layer in the template. Unit tests cover Zod schemas, utility functions, auth logic, and permission checks. E2E tests cover critical user flows: registration, login, password reset, subscription creation, plan changes, dashboard navigation, and admin actions. E2E tests run against a real Postgres instance, not mocks.

## Consequences

### Positive
- Two test layers keep the test suite simple and fast to understand for new contributors
- Vitest runs in milliseconds for unit tests — tight feedback loop during development
- Playwright E2E tests catch real bugs across the full stack including database, API, and UI
- No database mocking means E2E tests validate actual queries and migrations

### Negative
- No integration tests means API route logic is only tested through E2E, which is slower to run and debug
- E2E tests require a running Postgres instance and potentially a Stripe test environment
- Playwright tests are inherently slower than unit tests and more prone to flakiness

### Risks
- E2E test flakiness could erode trust in the test suite — mitigated by using Playwright's auto-waiting, retry configuration, and keeping tests focused on user-visible outcomes rather than implementation details
- Missing integration layer could miss edge cases in API validation — mitigated by thorough unit testing of Zod schemas and validation logic that the API routes depend on
- Test Postgres setup adds CI complexity — mitigated by providing a `docker-compose.test.yml` that spins up a clean Postgres instance for test runs
