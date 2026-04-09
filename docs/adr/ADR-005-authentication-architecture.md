# ADR-005: Authentication Architecture

**Date:** 2026-04-09
**Status:** Accepted

## Context

A SaaS template must ship with authentication that covers both human users and programmatic access. Framework-coupled auth solutions (Wasp's built-in auth, Next-Auth) provide fast setup but create framework lock-in and limit customization of flows like email verification, password reset, and role management.

The template needs: email/password registration with email verification, Google OAuth as a social login option, JWT-based sessions with refresh tokens, password reset via email, an API key system for service-to-service access, and role-based access control (RBAC) with at minimum admin and user roles.

Building custom auth is more initial work than using a managed solution, but it gives full control over the token lifecycle, session storage, and user data model. The auth system stores sessions in RuVector-Postgres and issues short-lived JWTs with longer-lived refresh tokens.

## Decision

Implement custom authentication with JWT sessions. Support email/password and Google OAuth. Include email verification, password reset, and an API key system. Implement RBAC with admin and user roles. Store all auth data in RuVector-Postgres. No third-party auth service or framework-coupled auth.

## Consequences

### Positive
- No framework or vendor lock-in for authentication
- Full control over token format, expiration, and refresh logic
- API key system enables service-to-service integrations out of the box
- RBAC can be extended to additional roles without migrating auth providers
- All auth data lives in the same database as application data

### Negative
- More implementation work than using Wasp, Auth0, or Clerk
- Security-critical code must be carefully reviewed — no delegating to a managed service
- Must implement and maintain email sending for verification and password reset

### Risks
- **Security vulnerabilities in custom auth**: JWT handling, password hashing, and token storage are easy to get wrong. Mitigation: use battle-tested libraries (bcrypt/argon2 for hashing, jose for JWT), follow OWASP guidelines, and include security review in the development process.
- **OAuth provider changes**: Google may change OAuth scopes or endpoints. Mitigation: use an OAuth library that abstracts provider-specific details (like arctic or passport).
