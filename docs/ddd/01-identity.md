# Identity Context

## Overview

The Identity context handles all authentication, authorization, and user management. It is the system's entry point for user registration, login, OAuth, session management, and API key lifecycle.

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| User | A registered account holder identified by email |
| Session | An active authenticated period tied to a JWT |
| ApiKey | A long-lived credential for programmatic API access |
| Role | A permission level assigned to a User (e.g., user, admin) |
| Verification | The process of confirming email ownership |
| OAuth | Third-party authentication via Google |

## Entities

### User
- Fields: id, email, hashedPassword, name, role, emailVerified, avatarUrl, createdAt, updatedAt
- Invariants: Email must be unique. Password must meet minimum complexity. Role defaults to "user".

### Session
- Fields: id, userId, token, expiresAt, createdAt, ipAddress, userAgent
- Invariants: A session must reference a valid User. Expired sessions cannot be used for authentication.

### ApiKey
- Fields: id, userId, name, hashedKey, prefix, scopes, lastUsedAt, expiresAt, revokedAt, createdAt
- Invariants: An API key belongs to exactly one User. A revoked key cannot be used. The prefix is the only visible portion after creation.

### Role
- Fields: name, permissions
- Invariants: System roles (user, admin) cannot be deleted.

## Value Objects

### Email
- Fields: address (string)
- Validation: Must be a valid RFC 5322 email. Stored lowercase. Immutable after creation.

### HashedPassword
- Fields: hash (string)
- Validation: Produced by bcrypt/argon2. Never stored as plaintext. Minimum 8 characters before hashing.

### TokenScope
- Fields: scopes (string[])
- Validation: Each scope must be from the allowed set (e.g., read, write, admin).

### JwtPayload
- Fields: sub (userId), role, exp, iat
- Validation: exp must be in the future. sub must reference a valid User.

## Aggregates

### User (Root: User)
- Contains: Sessions, ApiKeys
- Invariants: A User may have at most 5 active sessions. A User may have at most 10 active API keys. Deleting a User cascades to all Sessions and ApiKeys.

## Domain Events

| Event | Trigger | Data |
|-------|---------|------|
| UserRegistered | New account created | userId, email, role |
| EmailVerified | User confirms email link | userId, verifiedAt |
| PasswordReset | User completes password reset | userId, resetAt |
| ApiKeyCreated | User generates new API key | userId, apiKeyId, scopes |
| ApiKeyRevoked | User or admin revokes a key | userId, apiKeyId, revokedAt |
| SessionCreated | Successful login | userId, sessionId, ipAddress |
| SessionExpired | Token TTL exceeded or logout | userId, sessionId, expiredAt |

## Repository Interfaces

### UserRepository
- findById(id): User | null
- findByEmail(email): User | null
- create(user): User
- update(id, fields): User
- delete(id): void
- list(filter, pagination): User[]

### SessionRepository
- findById(id): Session | null
- findByUserId(userId): Session[]
- create(session): Session
- deleteExpired(): number
- deleteByUserId(userId): void

### ApiKeyRepository
- findByPrefix(prefix): ApiKey | null
- findByUserId(userId): ApiKey[]
- create(apiKey): ApiKey
- revoke(id): void

## Domain Services

### AuthService
- register(email, password, name): Creates User, emits UserRegistered
- login(email, password): Validates credentials, creates Session, emits SessionCreated
- verifyEmail(token): Marks email verified, emits EmailVerified
- resetPassword(token, newPassword): Updates password, emits PasswordReset
- logout(sessionId): Deletes session, emits SessionExpired

### OAuthService
- handleGoogleCallback(code): Exchanges code for profile, creates or links User, creates Session

### ApiKeyService
- generate(userId, name, scopes): Creates ApiKey, emits ApiKeyCreated, returns plaintext key once
- validate(plaintextKey): Hashes and looks up by prefix, checks expiry and revocation
- revoke(apiKeyId): Marks key revoked, emits ApiKeyRevoked
