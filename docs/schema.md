# Database Schema

## ER Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        text hashed_password
        varchar name
        text avatar_url
        varchar role
        boolean email_verified
        jsonb preferences
        timestamptz created_at
    }

    sessions {
        uuid id PK
        uuid user_id FK
        text token UK
        timestamptz expires_at
    }

    verification_tokens {
        uuid id PK
        uuid user_id FK
        text token UK
        varchar type
        timestamptz expires_at
    }

    api_keys {
        uuid id PK
        uuid user_id FK
        varchar name
        text key_hash
        text_arr scopes
        timestamptz last_used_at
        timestamptz created_at
        timestamptz revoked_at
    }

    subscription_plans {
        uuid id PK
        varchar name
        varchar stripe_price_id UK
        varchar tier
        integer price
        text_arr features
        timestamptz created_at
    }

    subscriptions {
        uuid id PK
        uuid user_id FK UK
        uuid plan_id FK
        varchar stripe_subscription_id
        varchar stripe_customer_id
        varchar status
        timestamptz current_period_start
        timestamptz current_period_end
        timestamptz created_at
        timestamptz updated_at
    }

    activity_logs {
        uuid id PK
        uuid user_id FK
        varchar action
        jsonb details
        inet ip_address
        timestamptz created_at
    }

    jobs {
        uuid id PK
        varchar type
        jsonb payload
        varchar status
        integer attempts
        integer max_attempts
        timestamptz run_at
        timestamptz started_at
        timestamptz completed_at
        text error
    }

    notifications {
        uuid id PK
        uuid user_id FK
        varchar title
        text message
        varchar type
        boolean read
        timestamptz created_at
    }

    file_uploads {
        uuid id PK
        uuid user_id FK
        text key
        varchar filename
        varchar mime_type
        integer size
        timestamptz created_at
    }

    analytics_events {
        uuid id PK
        varchar session_id
        varchar event_type
        text page
        text referrer
        text user_agent
        timestamptz created_at
    }

    users ||--o{ sessions : "has"
    users ||--o{ verification_tokens : "has"
    users ||--o{ api_keys : "has"
    users ||--o| subscriptions : "has"
    users ||--o{ activity_logs : "has"
    users ||--o{ notifications : "has"
    users ||--o{ file_uploads : "has"
    subscription_plans ||--o{ subscriptions : "has"
```

## Tables Summary

| Table | Description | Rows relationship |
|-------|-------------|-------------------|
| `users` | User accounts with auth credentials and profile | Root entity |
| `sessions` | Active login sessions (JWT + session token) | Many per user |
| `verification_tokens` | Email verification and password reset tokens | Many per user |
| `api_keys` | Developer API keys (stored as SHA-256 hash) | Many per user |
| `subscription_plans` | Available billing tiers (Free, Pro, Enterprise) | Seeded data |
| `subscriptions` | User subscription state (1:1 with user) | One per user |
| `activity_logs` | Audit trail of user and admin actions | Many per user |
| `jobs` | Background job queue (email, etc.) | Standalone |
| `notifications` | In-app notification inbox | Many per user |
| `file_uploads` | S3 file upload metadata | Many per user |
| `analytics_events` | Anonymous pageview tracking | Standalone |
| `_migrations` | Migration tracking (auto-managed) | System table |
