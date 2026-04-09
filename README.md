# Edra SaaS Starter

A production-ready SaaS starter kit built with React, Express, PostgreSQL, and Stripe. Includes authentication, billing, admin dashboard, API keys, notifications, file uploads, analytics, blog, docs, and dark mode out of the box.

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

## Quick Start

```bash
git clone <repo-url> edra-saas-starter
cd edra-saas-starter
cp .env.example .env   # Fill in your values (see Env Vars below)
docker-compose up -d   # Start PostgreSQL
npm install
npm run db:migrate
npm run db:seed
npm run dev            # Frontend on localhost:5173
npm run server         # API on localhost:3001
```

Open [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run build` | TypeScript check + Vite production build |
| `npm test` | Run Vitest test suite |
| `npm run lint` | ESLint |
| `npm run server` | Start Express API server (hot-reload via tsx) |
| `npm run worker` | Start background job worker |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes |
| `APP_URL` | Frontend URL (default: `http://localhost:5173`) | No |
| `PORT` | API server port (default: `3001`) | No |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `RESEND_API_KEY` | Resend API key for transactional email | Yes |
| `RESEND_FROM_EMAIL` | Sender email address | Yes |
| `AWS_ACCESS_KEY_ID` | AWS key for S3 file uploads | For uploads |
| `AWS_SECRET_ACCESS_KEY` | AWS secret for S3 | For uploads |
| `AWS_S3_BUCKET` | S3 bucket name | For uploads |
| `AWS_REGION` | AWS region (default: `us-east-1`) | For uploads |

## Project Structure

```
src/
  components/       # Shared React components
    ui/             # shadcn/ui primitives (Button, Card, etc.)
  hooks/            # Custom React hooks (useAuth, etc.)
  lib/              # Utilities (cn, nav-config)
  pages/
    auth/           # Login, Signup, Forgot/Reset Password
    dashboard/      # Dashboard, Profile, Settings, Subscription, API Keys, Admin
    admin/          # Admin Users, Analytics, Activity
    landing/        # Landing page (Hero, Features, Pricing, CTA)
    blog/           # Blog listing + post pages
    docs/           # Documentation pages (MDX)
    legal/          # Privacy Policy, Terms of Service
  server/
    routes/         # Express route handlers
    middleware/     # Auth, RBAC, API key middleware
    services/       # Email, Upload services
    lib/            # JWT, password hashing, job queue, Stripe
    db/
      migrations/   # SQL migration files
  types/            # Shared TypeScript types
```

## How to Add a New Page

1. Create the page component in `src/pages/` (e.g., `src/pages/dashboard/my-page.tsx`)
2. Add a `<Route>` in `src/App.tsx` under the appropriate parent route
3. Add a nav entry in `src/lib/nav-config.ts` with title, path, and icon

## Deployment (Docker + GCR)

```bash
# Build the production image
docker build -t edra-saas .

# Tag and push to Google Container Registry
docker tag edra-saas gcr.io/PROJECT_ID/edra-saas
docker push gcr.io/PROJECT_ID/edra-saas

# Deploy to Cloud Run
gcloud run deploy edra-saas \
  --image gcr.io/PROJECT_ID/edra-saas \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=...,JWT_SECRET=...,STRIPE_SECRET_KEY=..."
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui |
| Routing | React Router 7 |
| State | TanStack React Query |
| Animations | Framer Motion |
| Backend | Express 5, Node.js |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Billing | Stripe (Checkout + Customer Portal + Webhooks) |
| Email | Resend |
| File Storage | AWS S3 (presigned uploads) |
| Testing | Vitest, Testing Library |
| Linting | ESLint |
