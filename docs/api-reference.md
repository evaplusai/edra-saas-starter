# API Reference

Base URL: `http://localhost:3001`

All request/response bodies are JSON unless otherwise noted. Auth-required endpoints expect an `Authorization: Bearer <token>` header.

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Log in |
| POST | `/auth/logout` | Yes | Log out (deletes sessions) |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/auth/verify-email` | No | Verify email address |
| POST | `/auth/forgot-password` | No | Request password reset email |
| POST | `/auth/reset-password` | No | Reset password with token |

### POST /auth/register

**Request:**
```json
{ "name": "string", "email": "string", "password": "string" }
```

**Response (201):**
```json
{ "user": { "id", "email", "name", "avatar_url", "role", "email_verified", "created_at" }, "token": "jwt" }
```

**Errors:** `400 VALIDATION_ERROR`, `409 EMAIL_EXISTS`

### POST /auth/login

**Request:**
```json
{ "email": "string", "password": "string" }
```

**Response (200):**
```json
{ "user": { ... }, "token": "jwt" }
```

**Errors:** `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`

### POST /auth/forgot-password

**Request:**
```json
{ "email": "string" }
```

**Response (200):** `{ "success": true }` (always, to prevent enumeration)

### POST /auth/reset-password

**Request:**
```json
{ "token": "string", "password": "string" }
```

**Response (200):** `{ "success": true }`

**Errors:** `400 INVALID_TOKEN`

### POST /auth/verify-email

**Request:**
```json
{ "token": "string" }
```

**Response (200):** `{ "success": true }`

**Errors:** `400 INVALID_TOKEN`

---

## Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/users/me` | Yes | Update profile |
| GET | `/users/me/preferences` | Yes | Get notification preferences |
| PATCH | `/users/me/preferences` | Yes | Update notification preferences |

### PATCH /users/me

**Request:**
```json
{
  "name": "string (optional)",
  "avatar_url": "string (optional)",
  "current_password": "string (optional, required if changing password)",
  "new_password": "string (optional)"
}
```

**Response (200):**
```json
{ "user": { "id", "email", "name", "avatar_url", "role", "email_verified", "created_at" } }
```

### GET /users/me/preferences

**Response (200):**
```json
{ "preferences": { "email_marketing": false, "email_product": true, "in_app": true } }
```

### PATCH /users/me/preferences

**Request:**
```json
{ "email_marketing": true, "email_product": false, "in_app": true }
```

**Response (200):**
```json
{ "preferences": { ... } }
```

---

## Billing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/billing/plans` | No | List subscription plans |
| GET | `/billing/subscription` | Yes | Get current subscription |
| POST | `/billing/create-checkout` | Yes | Create Stripe Checkout session |
| POST | `/billing/create-portal` | Yes | Create Stripe Customer Portal session |
| POST | `/billing/webhook` | No | Stripe webhook (raw body) |

### GET /billing/plans

**Response (200):**
```json
{ "plans": [{ "id", "name", "stripe_price_id", "tier", "price", "features" }] }
```

### GET /billing/subscription

**Response (200):**
```json
{ "subscription": { "id", "plan_name", "tier", "status", "current_period_end" } }
```

### POST /billing/create-checkout

**Request:**
```json
{ "price_id": "string", "success_url": "string (url)", "cancel_url": "string (url)" }
```

**Response (200):**
```json
{ "url": "https://checkout.stripe.com/..." }
```

### POST /billing/create-portal

**Request:**
```json
{ "return_url": "string (optional)" }
```

**Response (200):**
```json
{ "url": "https://billing.stripe.com/..." }
```

---

## API Keys

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api-keys` | Yes | Create a new API key |
| GET | `/api-keys` | Yes | List API keys (masked) |
| DELETE | `/api-keys/:id` | Yes | Revoke an API key |

### POST /api-keys

**Request:**
```json
{ "name": "string", "scopes": ["string"] }
```

**Response (201):**
```json
{ "apiKey": { "id", "name", "key": "sk_...", "scopes", "created_at" } }
```

The plain key is only returned on creation. Max 10 active keys per user.

### GET /api-keys

**Response (200):**
```json
{ "apiKeys": [{ "id", "name", "prefix": "sk_abcd...", "scopes", "last_used_at", "created_at", "revoked" }] }
```

### DELETE /api-keys/:id

**Response:** `204 No Content`

**Errors:** `404 NOT_FOUND`

---

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Yes | List notifications (paginated) |
| GET | `/notifications/unread-count` | Yes | Get unread count |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |

### GET /notifications

**Query params:** `page` (default 1), `limit` (default 20, max 100)

**Response (200):**
```json
{ "notifications": [{ "id", "title", "message", "type", "read", "created_at" }], "total": 42, "page": 1, "limit": 20 }
```

### GET /notifications/unread-count

**Response (200):**
```json
{ "count": 5 }
```

### PATCH /notifications/:id/read

**Response (200):**
```json
{ "notification": { ... } }
```

---

## Uploads

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/uploads/presign` | Yes | Get presigned S3 upload URL |

### POST /uploads/presign

**Request:**
```json
{ "filename": "photo.png", "mimeType": "image/png", "size": 204800 }
```

**Response (200):**
```json
{ "uploadUrl": "https://s3...", "key": "uploads/uuid/photo.png", "publicUrl": "https://..." }
```

---

## Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/analytics/pageview` | No | Record a pageview event |

### POST /analytics/pageview

**Request:**
```json
{ "sessionId": "string", "page": "/dashboard", "referrer": "https://google.com (optional)" }
```

**Response (201):**
```json
{ "success": true }
```

---

## Admin

All admin endpoints require authentication and `admin` role.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Admin | List users (paginated, searchable) |
| PATCH | `/admin/users/:id` | Admin | Update user role/status |
| GET | `/admin/analytics/revenue` | Admin | Revenue / MRR analytics |
| GET | `/admin/analytics/subscribers` | Admin | Subscriber breakdown |
| GET | `/admin/activity` | Admin | Activity logs (paginated, filterable) |

### GET /admin/users

**Query params:** `page`, `search`, `role`

**Response (200):**
```json
{
  "users": [{ "id", "name", "email", "role", "email_verified", "subscription_tier", "subscription_status", "created_at" }],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

### PATCH /admin/users/:id

**Request:**
```json
{ "role": "admin|user (optional)", "status": "active|disabled (optional)" }
```

**Response (200):** `{ "success": true }`

### GET /admin/analytics/revenue

**Response (200):**
```json
{ "mrr": [{ "month": "2025-01-01T00:00:00.000Z", "mrr": 29900 }], "totalMrr": 29900 }
```

### GET /admin/analytics/subscribers

**Response (200):**
```json
{
  "subscribers": [{ "tier": "pro", "count": 10 }],
  "totalUsers": 50,
  "transactions": [{ "action", "details", "user_name", "created_at" }]
}
```

### GET /admin/activity

**Query params:** `page`, `action`, `from`, `to`

**Response (200):**
```json
{
  "logs": [{ "id", "user_name", "action", "details", "ip_address", "created_at" }],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

---

## Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check |

**Response (200):**
```json
{ "status": "ok" }
```
