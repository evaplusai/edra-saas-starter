# SaaS Portal Template -- Implementation Plan

> 4 sprints / 8 weeks. React + Vite + Tailwind + shadcn/ui + RuVector-Postgres.

---

## Tech Stack Reference

| Layer | Libraries |
|-------|-----------|
| Framework | React 18, TypeScript 5, Vite |
| Styling | Tailwind CSS, shadcn/ui (Radix), Lucide icons, Framer Motion |
| Data | React Query, React Hook Form, Zod, Recharts |
| Database | RuVector-Postgres (standard Postgres wire protocol) |
| Routing | React Router v6 |
| Theming | next-themes (dark/light) |

## Project Structure

```
src/
  App.tsx
  main.tsx
  pages/
  components/
    ui/           # shadcn/ui primitives
  hooks/
  lib/
  types/
  styles/
  server/
```

---

## Sprint 1: Foundation (Week 1--2)

### Day 1--2: Project Scaffold

| # | Task | Deliverable | How | Acceptance |
|---|------|-------------|-----|------------|
| 1 | - [ ] Init Vite project | `package.json`, `vite.config.ts`, `tsconfig.json` | `npm create vite@latest . -- --template react-ts` | `npm run dev` serves blank page on localhost |
| 2 | - [ ] Install core deps | updated `package.json` | `npm i react-router-dom @tanstack/react-query react-hook-form zod recharts framer-motion next-themes lucide-react` | All imports resolve without error |
| 3 | - [ ] Tailwind config with HSL tokens | `tailwind.config.ts`, `src/styles/globals.css` | Define CSS variables: `--primary`, `--secondary`, `--accent`, `--destructive`, `--muted`, `--background`, `--foreground`, `--card`, `--border`, `--input`, `--ring` in HSL format. Extend Tailwind `colors` to reference `hsl(var(--*))` | `bg-primary`, `text-foreground` etc. render correct colors in both light and dark mode |
| 4 | - [ ] shadcn/ui init + components | `src/components/ui/*.tsx` | `npx shadcn-ui@latest init`, then add: `button`, `input`, `card`, `dialog`, `dropdown-menu`, `toast`, `label`, `separator`, `avatar`, `badge`, `sheet`, `scroll-area`, `tooltip` | Each component renders in Storybook-style test page without error |
| 5 | - [ ] next-themes provider | `src/components/theme-provider.tsx` | Wrap with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>` | Toggling theme switches `<html class="dark">` and colors change |
| 6 | - [ ] App.tsx provider nesting | `src/App.tsx` | Nest: `QueryClientProvider` > `ThemeProvider` > `TooltipProvider` > `Toaster` + `Sonner` > `BrowserRouter` > `Routes` | App boots without provider errors; toast fires from any page |
| 7 | - [ ] ESLint + Prettier | `.eslintrc.cjs`, `.prettierrc` | `eslint-config-react-app` + `@typescript-eslint`, Prettier with `semi: true, singleQuote: true, trailingComma: 'all'` | `npm run lint` passes clean on scaffold |
| 8 | - [ ] Vitest setup | `vitest.config.ts`, `src/test/setup.ts` | `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom` | `npm test` runs and passes a trivial `App.test.tsx` |

### Day 3--4: Dashboard Layout

| # | Task | Deliverable | How | Acceptance |
|---|------|-------------|-----|------------|
| 9 | - [ ] Nav config | `src/lib/nav-config.ts` | Export `navConfig: { title: string; path: string; icon: LucideIcon; roles?: string[] }[]` | Type-checks; contains at least Dashboard, Settings, Admin entries |
| 10 | - [ ] Sidebar component | `src/components/sidebar.tsx` | Map `navConfig` to `NavLink` items. Use shadcn `scroll-area`. Highlight active route. Collapse state via React state. | Clicking nav item navigates; active item is visually highlighted |
| 11 | - [ ] Header component | `src/components/header.tsx` | Logo (left), theme toggle button (Lucide `Sun`/`Moon` + `next-themes` `useTheme`), user dropdown (shadcn `dropdown-menu`: avatar, name, "Sign out") | Theme toggles; dropdown opens; sign-out triggers auth logout |
| 12 | - [ ] Dashboard layout | `src/pages/dashboard/layout.tsx` | Sidebar + Header + `<Outlet />` main area. CSS grid: `grid-cols-[260px_1fr]` on desktop | Nested routes render inside main area |
| 13 | - [ ] Responsive sidebar | update `sidebar.tsx`, `layout.tsx` | Below `md` breakpoint, sidebar hidden; hamburger in header opens shadcn `Sheet` with same nav | Resize to 375px: sidebar gone, hamburger visible, sheet opens with nav |
| 14 | - [ ] ProtectedRoute wrapper | `src/components/protected-route.tsx` | Check auth context; if unauthenticated redirect to `/login` via `<Navigate>` | Unauthenticated user hitting `/dashboard` lands on `/login` |
| 15 | - [ ] PublicRoute wrapper | `src/components/public-route.tsx` | If authenticated redirect to `/dashboard` | Logged-in user hitting `/login` redirects to `/dashboard` |

### Day 5--6: Auth System

#### Database Tables

| Table | Columns |
|-------|---------|
| `users` | `id` UUID PK, `email` VARCHAR(255) UNIQUE NOT NULL, `hashed_password` TEXT NOT NULL, `name` VARCHAR(100), `avatar_url` TEXT, `role` VARCHAR(20) DEFAULT 'user', `email_verified` BOOLEAN DEFAULT false, `created_at` TIMESTAMPTZ DEFAULT now() |
| `sessions` | `id` UUID PK, `user_id` UUID FK, `token` TEXT UNIQUE NOT NULL, `expires_at` TIMESTAMPTZ NOT NULL |
| `verification_tokens` | `id` UUID PK, `user_id` UUID FK, `token` TEXT UNIQUE NOT NULL, `type` VARCHAR(30) NOT NULL, `expires_at` TIMESTAMPTZ NOT NULL |

- [ ] Create migration file: `src/server/db/migrations/001_auth.sql`

#### API Routes

| Method | Path | Body / Params | Returns | Notes |
|--------|------|---------------|---------|-------|
| POST | `/auth/register` | `{ name, email, password }` | `{ user, token }` | Hash password with bcrypt (cost 12). Create session. Send welcome email job. |
| POST | `/auth/login` | `{ email, password }` | `{ user, token }` | Verify password. Create session. |
| POST | `/auth/logout` | -- | `204` | Delete session row. |
| POST | `/auth/verify-email` | `{ token }` | `{ success }` | Mark `email_verified = true`. Delete token. |
| POST | `/auth/forgot-password` | `{ email }` | `{ success }` | Create verification_token type='password_reset'. Queue email job. |
| POST | `/auth/reset-password` | `{ token, password }` | `{ success }` | Validate token. Update hashed_password. Delete token. |
| GET | `/auth/me` | -- | `{ user }` | JWT middleware required. Return current user (no password). |

- [ ] Create route handlers: `src/server/routes/auth.ts`
- [ ] JWT middleware: `src/server/middleware/auth.ts` -- validate token from `Authorization: Bearer <token>`, attach `req.user`
- [ ] Password utils: `src/lib/password.ts` -- `hashPassword(plain)`, `verifyPassword(plain, hash)`
- [ ] JWT utils: `src/lib/jwt.ts` -- `signToken(payload)`, `verifyToken(token)`

#### Frontend Pages

| Page | File | Components Used | Details |
|------|------|-----------------|---------|
| - [ ] Login | `src/pages/auth/login.tsx` | `Card`, `Input`, `Button`, `Label` | React Hook Form + Zod schema `{ email: z.string().email(), password: z.string().min(8) }`. Google OAuth button (outline variant). Link to `/signup`. |
| - [ ] Signup | `src/pages/auth/signup.tsx` | same | Fields: name, email, password. Zod: name min 2, email, password min 8. Link to `/login`. |
| - [ ] Forgot password | `src/pages/auth/forgot-password.tsx` | same | Email field. Success state shows "check your email" message. |
| - [ ] Reset password | `src/pages/auth/reset-password.tsx` | same | New password + confirm. Read token from URL query param. |

- [ ] Auth context: `src/hooks/use-auth.ts` -- `AuthProvider`, `useAuth()` returning `{ user, login, logout, register, isLoading }`
- [ ] Google OAuth: redirect to Google consent URL, callback route creates/links user, issues JWT

### Day 7--8: RBAC + API Keys

#### Role System

- [ ] Role enum: `admin | user` in `src/types/roles.ts`
- [ ] `<RequireRole role="admin">` component: `src/components/require-role.tsx` -- wraps children, redirects to `/dashboard` if role mismatch
- [ ] Server middleware: `checkRole(...roles)` in `src/server/middleware/rbac.ts` -- reads `req.user.role`, returns 403 if not in allowed list

#### API Keys

**Table: `api_keys`**

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `user_id` | UUID FK |
| `name` | VARCHAR(100) |
| `key_hash` | TEXT NOT NULL |
| `scopes` | TEXT[] DEFAULT '{}' |
| `last_used_at` | TIMESTAMPTZ |
| `created_at` | TIMESTAMPTZ DEFAULT now() |
| `revoked_at` | TIMESTAMPTZ |

- [ ] Migration: `src/server/db/migrations/002_api_keys.sql`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api-keys` | JWT | Generate key (return plain key once), store hash |
| GET | `/api-keys` | JWT | List user's keys (masked, no hash) |
| DELETE | `/api-keys/:id` | JWT | Set `revoked_at = now()` |

- [ ] Route handlers: `src/server/routes/api-keys.ts`
- [ ] API key auth middleware: `src/server/middleware/api-key-auth.ts` -- check `Authorization: Bearer sk_*` header, SHA-256 hash, lookup, validate scopes, update `last_used_at`

### Day 9--10: Integration and Testing

| # | Task | Deliverable | Acceptance |
|---|------|-------------|------------|
| 16 | - [ ] Wire auth into layout | Updated `header.tsx`, `layout.tsx` | Header shows user name + avatar from auth context; sign-out calls `logout()` |
| 17 | - [ ] Protect dashboard routes | Updated `App.tsx` routes | All `/dashboard/*` routes wrapped in `ProtectedRoute`; `/login`, `/signup` wrapped in `PublicRoute` |
| 18 | - [ ] Seed script | `src/server/db/seed.ts` | Creates admin user (`admin@example.com` / `password123`) and regular user (`user@example.com` / `password123`) |
| 19 | - [ ] Manual test checklist | n/a | Register new user, login, access dashboard, toggle theme, logout, forgot/reset password (stub email), login as admin |
| 20 | - [ ] Unit tests | `tests/auth-middleware.test.ts`, `tests/jwt.test.ts`, `tests/schemas.test.ts` | `npm test` passes: JWT sign/verify round-trip, middleware rejects expired token, Zod schemas reject invalid input |

---

## Sprint 2: Core Features (Week 3--4)

### Day 1--3: Stripe Integration

#### Database Tables

| Table | Columns |
|-------|---------|
| `subscription_plans` | `id` UUID PK, `name` VARCHAR(50), `stripe_price_id` VARCHAR(100) UNIQUE, `tier` VARCHAR(20) CHECK (tier IN ('free','pro','enterprise')), `price` INTEGER (cents), `features` TEXT[] |
| `subscriptions` | `id` UUID PK, `user_id` UUID FK UNIQUE, `plan_id` UUID FK, `stripe_subscription_id` VARCHAR(100), `stripe_customer_id` VARCHAR(100), `status` VARCHAR(30), `current_period_start` TIMESTAMPTZ, `current_period_end` TIMESTAMPTZ |

- [ ] Migration: `src/server/db/migrations/003_billing.sql`

#### API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/billing/create-checkout` | JWT | Create Stripe Checkout Session. Pass `price_id`, `success_url`, `cancel_url`. Return `{ url }`. |
| POST | `/billing/create-portal` | JWT | Create Stripe Billing Portal session. Return `{ url }`. |
| POST | `/billing/webhook` | Stripe signature | Verify `stripe-signature` header. Handle events below. |

- [ ] Route handlers: `src/server/routes/billing.ts`
- [ ] Stripe client: `src/server/lib/stripe.ts` -- `new Stripe(process.env.STRIPE_SECRET_KEY)`

#### Webhook Events

| Event | Handler |
|-------|---------|
| `checkout.session.completed` | Create/update subscription row. Set status `active`. |
| `customer.subscription.updated` | Update status, period dates. |
| `customer.subscription.deleted` | Set status `canceled`. |
| `invoice.payment_succeeded` | Log activity. Update `current_period_end`. |
| `invoice.payment_failed` | Set status `past_due`. Queue notification to user. |

- [ ] Webhook handler with event routing: `src/server/routes/billing.ts`

#### Frontend

| Component | File | Details |
|-----------|------|---------|
| - [ ] Pricing component | `src/components/pricing.tsx` | Fetch plans from `/billing/plans`. Render 3 tier cards (shadcn `Card`). Free tier has "Current plan" badge or "Get started" button. Pro/Enterprise have "Subscribe" buttons that POST to `/billing/create-checkout` and redirect. |
| - [ ] Subscription status card | `src/pages/dashboard/subscription.tsx` | Show current plan name, status badge (active=green, past_due=yellow, canceled=red), period end date, "Manage billing" button (opens Stripe portal). |

- [ ] Stripe test mode setup: document required env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`) in `.env.example`

### Day 4--5: Admin Dashboard

#### Activity Logs Table

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `user_id` | UUID FK |
| `action` | VARCHAR(50) |
| `details` | JSONB |
| `ip_address` | INET |
| `created_at` | TIMESTAMPTZ DEFAULT now() |

- [ ] Migration: `src/server/db/migrations/004_activity_logs.sql`

#### Admin Page: User Management

- [ ] File: `src/pages/admin/users.tsx`

| Feature | Implementation |
|---------|---------------|
| Table columns | Name, Email, Role (badge), Subscription tier (badge), Created at (relative date), Status (active/disabled) |
| Actions | Edit role (dropdown: admin/user), Disable/Enable toggle, View details (navigate to user detail page) |
| Search | Text input filtering by name or email (debounced 300ms, server-side) |
| Pagination | 20 per page. shadcn `Button` for prev/next. Show "Page X of Y". |

- [ ] API routes: GET `/admin/users?search=&page=&role=`, PATCH `/admin/users/:id` (role, status)
- [ ] Wrap admin routes with `checkRole('admin')` middleware

#### Admin Page: Revenue Analytics

- [ ] File: `src/pages/admin/analytics.tsx`

| Widget | Chart Type | Data Source |
|--------|-----------|-------------|
| MRR over time | Recharts `LineChart` | Aggregate subscriptions by month |
| Subscribers by tier | Recharts `BarChart` | Count subscriptions grouped by plan tier |
| Recent transactions | Table (shadcn) | Last 20 invoice events from activity_logs |

#### Admin Page: Activity Logs

- [ ] File: `src/pages/admin/activity.tsx`
- [ ] Display: table with user name, action, details (JSON preview), IP, timestamp
- [ ] Filters: action type dropdown, date range picker
- [ ] Auto-log triggers: login, signup, subscription change, admin role change, user disable/enable

### Day 6--7: User Dashboard

| Page | File | Components | Details |
|------|------|------------|---------|
| - [ ] Profile | `src/pages/dashboard/profile.tsx` | `Card`, `Input`, `Button`, `Avatar`, `Label` | Display name (editable), email (read-only), avatar upload, change password form (current + new + confirm). PATCH `/users/me`. |
| - [ ] Settings | `src/pages/dashboard/settings.tsx` | `Card`, `Switch`, `Label` | Notification preferences (email_marketing, email_product, in_app). Cookie preferences (analytics, functional). Store in `user_preferences` JSONB column or separate table. |
| - [ ] Subscription | `src/pages/dashboard/subscription.tsx` | `Card`, `Badge`, `Button` | Current plan card, upgrade/downgrade buttons (redirect to Stripe portal), billing history (list of invoices from Stripe API). |
| - [ ] API Keys | `src/pages/dashboard/api-keys.tsx` | `Card`, `Dialog`, `Input`, `Button`, `Badge` | Table: name, key (masked `sk_...****`), created date, last used. "Create key" button opens Dialog with name input; on submit show key once. "Revoke" button with confirm dialog. |

### Day 8--9: Background Jobs + Notifications

#### Jobs Table

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `type` | VARCHAR(50) NOT NULL |
| `payload` | JSONB |
| `status` | VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')) |
| `attempts` | INTEGER DEFAULT 0 |
| `max_attempts` | INTEGER DEFAULT 3 |
| `run_at` | TIMESTAMPTZ DEFAULT now() |
| `started_at` | TIMESTAMPTZ |
| `completed_at` | TIMESTAMPTZ |
| `error` | TEXT |

- [ ] Migration: `src/server/db/migrations/005_jobs.sql`

#### Worker

- [ ] File: `src/server/worker.ts`
- [ ] Poll loop: query `WHERE status = 'pending' AND run_at <= now() ORDER BY run_at LIMIT 5`, set status = 'processing'
- [ ] Process by type: `send_email`, `calculate_daily_stats`, `process_webhook`
- [ ] On success: set status = 'completed', `completed_at = now()`
- [ ] On failure: increment attempts, if `attempts >= max_attempts` set status = 'failed' (dead letter), else set status = 'pending', `run_at = now() + (attempts^2 * 1000)ms`

#### Notifications Table

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `user_id` | UUID FK |
| `title` | VARCHAR(200) |
| `message` | TEXT |
| `type` | VARCHAR(30) |
| `read` | BOOLEAN DEFAULT false |
| `created_at` | TIMESTAMPTZ DEFAULT now() |

- [ ] Migration: `src/server/db/migrations/006_notifications.sql`

#### Notification API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications?page=1&limit=20` | JWT | Paginated notifications for current user, newest first |
| PATCH | `/notifications/:id/read` | JWT | Set `read = true` |
| GET | `/notifications/unread-count` | JWT | Return `{ count }` |

- [ ] Route handlers: `src/server/routes/notifications.ts`

#### Bell Icon Component

- [ ] File: `src/components/notification-bell.tsx`
- [ ] Lucide `Bell` icon in header. shadcn `Badge` overlaid with unread count (poll every 30s via React Query `refetchInterval`). Click opens `dropdown-menu` with last 5 notifications. "View all" link to `/dashboard/notifications`.

### Day 10: Sprint 2 Testing

| # | Test | Method | Pass Criteria |
|---|------|--------|---------------|
| 21 | - [ ] Stripe webhook handling | `stripe listen --forward-to localhost:3000/billing/webhook` + trigger test events | Subscription created/updated in DB |
| 22 | - [ ] Admin CRUD | Manual: login as admin, search users, change role, disable user | Changes persist on refresh |
| 23 | - [ ] Notification flow | Trigger invoice.payment_failed webhook | Notification appears in bell dropdown |
| 24 | - [ ] Job processing | Queue `send_email` job, observe worker logs | Job moves pending > processing > completed |
| 25 | - [ ] Job retry | Queue job with handler that throws on first attempt | Job retries after delay, completes on second attempt |

---

## Sprint 3: Landing and Standard Features (Week 5--6)

### Day 1--3: Landing Page

| Section | File | Details |
|---------|------|---------|
| - [ ] Hero | `src/pages/landing/hero.tsx` | Headline (`h1`), subheadline (`p`), CTA `Button` (links to `/signup`), hero image/illustration on right. Framer Motion `motion.div` fade-up on load. |
| - [ ] Features grid | `src/pages/landing/features.tsx` | 6 `Card` components: Lucide icon + title + description. CSS grid `grid-cols-3` on desktop, `grid-cols-1` on mobile. Framer Motion `whileInView={{ opacity: 1, y: 0 }}` stagger 0.1s per card. |
| - [ ] Pricing section | `src/pages/landing/pricing.tsx` | Reuse `pricing.tsx` component from Sprint 2. Fetch plans from API. 3 tier cards with feature comparison. CTA buttons. |
| - [ ] Testimonials | `src/pages/landing/testimonials.tsx` | 3 `Card` components: quote text, avatar (`Avatar`), name, job title. Static data in component or JSON file. |
| - [ ] CTA section | `src/pages/landing/cta.tsx` | Headline + `Button` linking to `/signup`. Background gradient. |
| - [ ] Footer | `src/components/footer.tsx` | Logo, 3 link columns (Product: Features/Pricing/Docs, Company: About/Blog/Careers, Legal: Privacy/Terms), social icon links (Lucide `Github`, `Twitter`). |
| - [ ] Landing layout | `src/pages/landing/layout.tsx` | Navbar (logo, nav links, Login/Sign up buttons) + `<Outlet />` + Footer. No sidebar. |

#### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| 375px (mobile) | Single column. Hamburger nav. Hero stacks vertically. |
| 768px (tablet) | 2-column features grid. Side-by-side hero. |
| 1024px (desktop) | 3-column features. Full navbar. |
| 1440px (wide) | Max-width container `1280px` centered. |

- [ ] Test at all 4 breakpoints in Chrome DevTools

#### SEO

- [ ] Meta tags component: `src/components/seo-head.tsx` -- sets `<title>`, `<meta name="description">`, OG tags (`og:title`, `og:description`, `og:image`, `og:url`)
- [ ] JSON-LD: `Organization` schema on landing page (`src/pages/landing/hero.tsx`)

### Day 4--5: Email + File Uploads

#### Email Service

- [ ] File: `src/server/services/email.ts`
- [ ] Adapter pattern: `EmailAdapter` interface with `send(to, subject, html)`. `ResendAdapter` (primary), `SmtpAdapter` (fallback).
- [ ] Templates directory: `src/server/email-templates/`

| Template | File | Variables |
|----------|------|-----------|
| - [ ] Welcome | `welcome.html` | `{{ name }}`, `{{ verifyUrl }}` |
| - [ ] Password reset | `password-reset.html` | `{{ name }}`, `{{ resetUrl }}`, `{{ expiresIn }}` |
| - [ ] Subscription confirmation | `subscription-confirm.html` | `{{ name }}`, `{{ planName }}`, `{{ price }}` |

#### Trigger Points

| Event | Email | Implementation |
|-------|-------|---------------|
| After registration | Welcome | Queue `send_email` job in `/auth/register` handler |
| After forgot-password | Password reset | Queue `send_email` job in `/auth/forgot-password` handler |
| After subscription | Confirmation | Queue `send_email` job in `checkout.session.completed` webhook handler |

#### File Uploads

**Table: `file_uploads`**

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `user_id` | UUID FK |
| `key` | TEXT NOT NULL |
| `filename` | VARCHAR(255) |
| `mime_type` | VARCHAR(100) |
| `size` | INTEGER |
| `created_at` | TIMESTAMPTZ DEFAULT now() |

- [ ] Migration: `src/server/db/migrations/007_file_uploads.sql`
- [ ] Upload service: `src/server/services/upload.ts` -- generate presigned S3 PUT URL, validate mime type (image/jpeg, image/png, image/webp) and size (max 5MB), insert row into `file_uploads`
- [ ] API route: POST `/uploads/presign` (JWT) returns `{ uploadUrl, key }`
- [ ] Avatar upload on profile page: client-side crop/resize (use `canvas` API, max 256x256), PUT to presigned URL, PATCH `/users/me` with new `avatar_url`

### Day 6--7: SEO, Analytics, Cookie Consent

#### SEO

- [ ] `<SEOHead>` component: `src/components/seo-head.tsx` -- props: `title`, `description`, `image`, `url`. Renders `<Helmet>` or equivalent with `<title>`, meta description, `og:*` tags, `twitter:card` tags.
- [ ] Sitemap script: `scripts/generate-sitemap.ts` -- output `public/sitemap.xml` from known routes + blog post slugs
- [ ] `public/robots.txt`: allow all, reference sitemap
- [ ] JSON-LD on landing: `Organization` schema. On blog posts: `Article` schema.

#### Analytics

**Table: `analytics_events`**

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `session_id` | VARCHAR(100) |
| `event_type` | VARCHAR(50) |
| `page` | TEXT |
| `referrer` | TEXT |
| `user_agent` | TEXT |
| `created_at` | TIMESTAMPTZ DEFAULT now() |

- [ ] Migration: `src/server/db/migrations/008_analytics.sql`
- [ ] API route: POST `/analytics/pageview` (no auth required) -- accepts `{ sessionId, page, referrer }`
- [ ] Client hook: `src/hooks/use-page-tracking.ts` -- on route change, POST pageview if cookie consent granted. Generate `sessionId` with `crypto.randomUUID()` stored in `sessionStorage`.

#### Cookie Consent

- [ ] Component: `src/components/cookie-consent.tsx` -- banner at bottom of page. "Accept all" and "Manage preferences" buttons. Stores preference in `localStorage` key `cookie-consent` as JSON `{ analytics: boolean, functional: boolean }`.
- [ ] Check consent before sending analytics events
- [ ] Show banner only if `localStorage` has no consent record

### Day 8--9: Blog/Docs + Notifications Polish

#### Blog

- [ ] Content directory: `content/blog/*.md` with frontmatter: `title`, `date`, `slug`, `excerpt`, `author`
- [ ] Blog listing page: `src/pages/blog/index.tsx` -- fetch/import markdown files, render cards (shadcn `Card`) with title, date, excerpt. Sort by date descending.
- [ ] Blog post page: `src/pages/blog/[slug].tsx` -- render markdown to HTML (use `react-markdown` + `remark-gfm`). `<SEOHead>` with frontmatter values.
- [ ] Install: `npm i react-markdown remark-gfm`

#### Docs

- [ ] Content directory: `content/docs/*.md` with frontmatter: `title`, `order`, `slug`
- [ ] Docs layout: `src/pages/docs/layout.tsx` -- sidebar with doc titles ordered by `order`, main area renders selected doc
- [ ] Docs page: `src/pages/docs/[slug].tsx` -- render markdown, prev/next navigation at bottom

#### Legal Pages

- [ ] Privacy policy: `src/pages/legal/privacy.tsx` -- render `content/legal/privacy.md`
- [ ] Terms of service: `src/pages/legal/terms.tsx` -- render `content/legal/terms.md`

#### Notifications Polish

- [ ] Notification center page: `src/pages/dashboard/notifications.tsx` -- full list, "Mark all as read" button, empty state
- [ ] Toast on new notification: poll detects new unread count > previous, fire shadcn `toast` with title

### Day 10: Sprint 3 Testing

| # | Test | Method | Pass Criteria |
|---|------|--------|---------------|
| 26 | - [ ] Landing responsive | Chrome DevTools at 375, 768, 1024, 1440px | No horizontal scroll, no overlapping elements, readable text |
| 27 | - [ ] Email delivery | Resend test mode or Mailtrap | Welcome email arrives after registration |
| 28 | - [ ] File upload E2E | Upload avatar on profile page | Avatar appears in header and profile |
| 29 | - [ ] Blog rendering | Navigate to `/blog`, click post | Post renders with formatted markdown |
| 30 | - [ ] Analytics recording | Navigate pages with consent granted | Rows appear in `analytics_events` table |
| 31 | - [ ] Cookie consent | Clear localStorage, reload | Banner appears; dismiss, reload: banner gone |

---

## Sprint 4: Polish and Ship (Week 7--8)

### Day 1--3: E2E Tests

- [ ] Install Playwright: `npm i -D @playwright/test && npx playwright install`
- [ ] Config: `playwright.config.ts` -- base URL `http://localhost:5173`, webServer command `npm run dev`
- [ ] Test fixtures: `tests/e2e/fixtures.ts` -- helper to register user, login, get auth cookie

| Test Suite | File | Cases |
|-----------|------|-------|
| - [ ] Auth | `tests/e2e/auth.spec.ts` | Register new user. Login with credentials. Logout. Forgot password (submit form, verify success message). |
| - [ ] Payment | `tests/e2e/payment.spec.ts` | View pricing page. Click subscribe (verify redirect to Stripe test checkout). Return to app, verify subscription status card shows active. |
| - [ ] Dashboard | `tests/e2e/dashboard.spec.ts` | Navigate each sidebar item. View profile. Update display name. Toggle theme. |
| - [ ] Admin | `tests/e2e/admin.spec.ts` | Login as admin. View user list. Search by email. Change user role. View analytics page (charts render). |
| - [ ] Notifications | `tests/e2e/notifications.spec.ts` | Trigger notification (via API). Bell shows unread count. Click bell, see notification. Mark as read. |

### Day 4--5: Deployment

| # | Task | Deliverable | Details |
|---|------|-------------|---------|
| 32 | - [ ] Dockerfile | `Dockerfile` | Multi-stage: Stage 1 `node:20-alpine` install + build frontend (`npm run build`). Stage 2 `node:20-alpine` copy `dist/` + server code, `npm ci --production`, expose 3000, `CMD ["node", "src/server/index.js"]`. |
| 33 | - [ ] docker-compose | `docker-compose.yml` | Services: `app` (build `.`, ports 3000:3000, env_file `.env`, depends_on postgres), `postgres` (image `ruvector/ruvector-postgres:latest`, ports 5432:5432, volume `pgdata`). |
| 34 | - [ ] Env example | `.env.example` | All required vars: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_URL`. |
| 35 | - [ ] GitHub Actions | `.github/workflows/ci.yml` | Trigger: push to `main`. Jobs: lint (`npm run lint`), typecheck (`npx tsc --noEmit`), test (`npm test`), e2e (`npx playwright test`), build (`npm run build`), deploy (push to GCR). |
| 36 | - [ ] GCR deploy script | `scripts/deploy-gcr.sh` | Build Docker image, tag with git SHA, push to GCR, deploy Cloud Run service with env vars from Secret Manager. |
| 37 | - [ ] Health endpoint | `src/server/routes/health.ts` | GET `/health` returns `{ status: "ok", timestamp, version }`. No auth. Used by Cloud Run health check. |

### Day 6--7: Polish

| # | Task | Details |
|---|------|---------|
| 38 | - [ ] Page transitions | Wrap `<Routes>` in Framer Motion `<AnimatePresence mode="wait">`. Each page component: `motion.div` with `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `exit={{ opacity: 0 }}`, `transition={{ duration: 0.15 }}`. |
| 39 | - [ ] Micro-interactions | Button: `hover:scale-[1.02] active:scale-[0.98] transition-transform`. Card: `hover:shadow-lg transition-shadow`. Input focus: `ring-2 ring-ring` (already in shadcn defaults, verify). |
| 40 | - [ ] Loading skeletons | `src/components/ui/skeleton.tsx` (shadcn). Create skeleton variants: `DashboardCardSkeleton`, `TableRowSkeleton`, `ProfileSkeleton`. Show while React Query `isLoading`. |
| 41 | - [ ] Error boundaries | `src/components/error-boundary.tsx` -- class component with `componentDidCatch`. Fallback UI: "Something went wrong" card with "Try again" button. Wrap each page route. |
| 42 | - [ ] 404 page | `src/pages/not-found.tsx` -- "Page not found" with illustration, "Go home" button. Catch-all route `path="*"`. |
| 43 | - [ ] Lighthouse audit | Run Lighthouse on landing page and dashboard. Target: Performance 90+, Accessibility 90+, SEO 90+, Best Practices 90+. Fix issues: lazy-load images, add alt text, compress assets. |
| 44 | - [ ] Bundle size | Run `npx vite-bundle-visualizer`. Target < 200KB gzipped initial load. Strategies: dynamic import for Recharts, lazy-load admin pages, tree-shake Lucide icons. |

### Day 8--9: Documentation

| # | Task | File | Content |
|---|------|------|---------|
| 45 | - [ ] README | `README.md` | Project overview. Prerequisites (Node 20+, Docker). Quick start (clone, `cp .env.example .env`, fill values, `docker-compose up`, open localhost:3000). Env var reference table. Available scripts. Deployment guide (GCR steps). |
| 46 | - [ ] Contributing guide | `CONTRIBUTING.md` | How to add a new page: 1) create page component in `src/pages/`, 2) add route in `App.tsx`, 3) add entry to `navConfig`. How to add a new API route. How to run tests. Code style rules. |
| 47 | - [ ] DB schema diagram | `docs/schema.md` | Mermaid ER diagram of all tables with relationships. |
| 48 | - [ ] API reference | `docs/api-reference.md` | Table per resource: method, path, auth required, request body, response body, status codes. |

### Day 10: Ship

| # | Task | Details |
|---|------|---------|
| 49 | - [ ] Final QA pass | Walk through every page as admin and regular user. Verify: auth flow, billing flow, admin features, notifications, blog, docs, file upload, dark mode, mobile responsiveness. |
| 50 | - [ ] Tag release | `git tag v1.0.0 && git push origin v1.0.0` |
| 51 | - [ ] Deploy to production | Run GCR deploy script. Verify health endpoint. Verify Stripe webhook endpoint is configured for production. |
| 52 | - [ ] Smoke test production | Register account, subscribe to free tier, toggle theme, view blog post, view docs. |
| 53 | - [ ] Update README | Add live demo URL. Add deployment status badge from GitHub Actions. |

---

## Database Migration Order

| # | Migration File | Sprint | Tables Created |
|---|---------------|--------|----------------|
| 1 | `001_auth.sql` | 1 | `users`, `sessions`, `verification_tokens` |
| 2 | `002_api_keys.sql` | 1 | `api_keys` |
| 3 | `003_billing.sql` | 2 | `subscription_plans`, `subscriptions` |
| 4 | `004_activity_logs.sql` | 2 | `activity_logs` |
| 5 | `005_jobs.sql` | 2 | `jobs` |
| 6 | `006_notifications.sql` | 2 | `notifications` |
| 7 | `007_file_uploads.sql` | 3 | `file_uploads` |
| 8 | `008_analytics.sql` | 3 | `analytics_events` |

---

## Environment Variables

| Variable | Required | Sprint | Description |
|----------|----------|--------|-------------|
| `DATABASE_URL` | Yes | 1 | Postgres connection string |
| `JWT_SECRET` | Yes | 1 | Secret for signing JWTs (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Yes | 1 | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | 1 | Google OAuth client secret |
| `APP_URL` | Yes | 1 | Public-facing URL (e.g. `http://localhost:5173`) |
| `STRIPE_SECRET_KEY` | Yes | 2 | Stripe secret key (test mode) |
| `STRIPE_PUBLISHABLE_KEY` | Yes | 2 | Stripe publishable key (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Yes | 2 | Stripe webhook signing secret |
| `RESEND_API_KEY` | Yes | 3 | Resend API key for transactional email |
| `SMTP_HOST` | No | 3 | Fallback SMTP host |
| `SMTP_PORT` | No | 3 | Fallback SMTP port |
| `SMTP_USER` | No | 3 | Fallback SMTP username |
| `SMTP_PASS` | No | 3 | Fallback SMTP password |
| `S3_BUCKET` | Yes | 3 | S3 bucket name for file uploads |
| `S3_REGION` | Yes | 3 | S3 region |
| `S3_ACCESS_KEY` | Yes | 3 | S3 access key |
| `S3_SECRET_KEY` | Yes | 3 | S3 secret key |

---

## Acceptance Criteria Summary

| Sprint | Done When |
|--------|-----------|
| Sprint 1 | User can register, login, see dashboard, toggle dark mode, manage API keys. All unit tests pass. |
| Sprint 2 | User can subscribe via Stripe, admin can manage users and see analytics, background jobs run and retry. |
| Sprint 3 | Landing page live and responsive at 4 breakpoints, emails send, files upload, blog renders, cookie consent works. |
| Sprint 4 | All E2E tests pass, Docker builds and runs, deploys to GCR, Lighthouse 90+ on all categories, README complete. |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Stripe webhook delivery fails in production | Subscriptions not updated | Medium | Implement webhook retry queue; add admin alert on repeated failures; reconciliation script that syncs Stripe state nightly. |
| S3 presigned URL CORS issues | Avatar upload broken | High | Configure S3 bucket CORS policy during Sprint 3 Day 4. Test with actual browser upload, not just curl. |
| Bundle size exceeds 200KB | Slow initial load | Medium | Code-split Recharts and admin pages behind dynamic imports from Sprint 2. Monitor with `vite-bundle-visualizer` each sprint. |
| Google OAuth callback mismatch | Login broken in production | Medium | Document exact redirect URI format. Add to deployment checklist. Test OAuth flow in staging before production. |
| Job worker crashes silently | Emails/notifications not sent | Medium | Add health check for worker process. Log worker heartbeat. Alert if no jobs processed in 10 minutes when queue is non-empty. |
| Database migrations fail on deploy | App crashes on start | Low | Run migrations in CI before deploy. Add migration dry-run step. Keep rollback SQL for each migration. |

---

## Dependencies Between Sprints

```
Sprint 1 ──────────────────────────────── Sprint 2
  Auth system ──────────────────────────── Stripe (needs user_id)
  RBAC ─────────────────────────────────── Admin dashboard (needs role check)
  Dashboard layout ─────────────────────── All dashboard pages
  API key middleware ────────────────────── (available for external integrations)

Sprint 2 ──────────────────────────────── Sprint 3
  Subscription plans ───────────────────── Landing pricing section
  Job worker ───────────────────────────── Email sending
  Notifications ────────────────────────── Notification polish

Sprint 3 ──────────────────────────────── Sprint 4
  All features ─────────────────────────── E2E tests
  Landing page ─────────────────────────── Lighthouse audit
  All code ─────────────────────────────── Deployment pipeline
```
