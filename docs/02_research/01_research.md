# edra-saas-starter: Research & Development Plan

**Date:** 2026-04-09
**Status:** Active

---

## 1. Executive Summary

edra-starter is a reusable SaaS portal template. Clone it, configure env vars, start building product features. It ships standard SaaS infrastructure (auth, payments, dashboards, landing page) on a React + Vite + RuVector-Postgres stack. The template follows Ruv's actual development patterns: flat component structure, local state management, Tailwind + CSS variables for theming, and shadcn/ui primitives. RuVector-Postgres is the database — it handles all relational queries like standard Postgres.

---

## 2. How Ruv Builds Things

Before designing the template, we studied how Ruv actually structures projects across vibing (landing page), infinity-ui (component library), RuView (desktop dashboard), and ruvocal (full-stack chat app). These are the real patterns.

### Project Structure

```
src/
├── App.tsx              # Root: providers + router
├── main.tsx             # Entry point
├── pages/               # One file per page
├── components/          # Flat with feature folders when needed
│   ├── ui/              # shadcn/ui primitives (button, dialog, etc.)
│   └── [Feature].tsx    # Self-contained feature components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── types/               # TypeScript interfaces
└── styles/              # Global CSS + Tailwind config
```

### App Bootstrap

Every Ruv React project nests providers the same way:

```tsx
<QueryClientProvider>
  <TooltipProvider>
    <Toaster /> <Sonner />
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  </TooltipProvider>
</QueryClientProvider>
```

### State Management

Local component state with `useState`. No Redux, no Zustand, no global stores. Data is passed via props. Server state via React Query. Components are self-contained — each manages its own lifecycle.

### Styling

- **Tailwind CSS** — utility-first, responsive breakpoints (sm/md/lg)
- **CSS variables** — HSL-based color tokens in `:root` and `.dark` for theming
- **next-themes** — dark/light mode toggle
- **CSS keyframes** — custom animations (fade-in, blink, pulse)
- **No CSS-in-JS** — no styled-components, no emotion

### Components

- shadcn/ui primitives (copied into project, not imported from node_modules)
- Radix UI headless components underneath
- Lucide React for icons
- Components stay under 500 lines
- Small (<2KB), Medium (2-8KB), Large (8-15KB) — nothing over 20KB

### Adding a New Feature

No plugin system. The actual pattern:

1. Create a page: `src/pages/MyFeature.tsx`
2. Add a route in `App.tsx`
3. Add a sidebar item to the nav config array
4. Create components in `src/components/` as needed
5. Add API endpoints if the feature needs a backend

That's it. No manifests, no registration system.

---

## 3. Feature Breakdown

### Portal Features (ships with every clone)

| Feature | What Ships | Priority |
|---------|-----------|----------|
| **Auth** | Email/password, Google OAuth, email verification, password reset, JWT sessions, protected routes | Sprint 1 |
| **RBAC** | Admin/user roles, route guards, API middleware | Sprint 1 |
| **API Keys** | Generate, revoke, scope — for service-to-service access | Sprint 1 |
| **Dashboard Shell** | Sidebar nav (config array), header, responsive layout, dark/light mode | Sprint 1 |
| **Stripe Payments** | Free/Pro/Enterprise tiers, checkout, customer portal, webhooks | Sprint 2 |
| **Admin Panel** | User management (list, search, edit, disable), revenue analytics (Recharts), activity logs, daily stats job | Sprint 2 |
| **User Dashboard** | Profile, settings, subscription status, API key management | Sprint 2 |
| **Landing Page** | Hero, features grid, pricing (synced with Stripe), testimonials, CTA, footer, responsive | Sprint 3 |
| **Email** | Transactional: welcome, password reset, subscription confirm | Sprint 3 |
| **File Uploads** | S3-compatible presigned URLs, avatar upload | Sprint 3 |
| **SEO** | Meta tags, OG tags, sitemap, robots.txt, JSON-LD | Sprint 3 |
| **Analytics** | Page view tracking, behavior tracking | Sprint 3 |
| **Cookie Consent** | Banner with preference storage | Sprint 3 |
| **Blog/Docs** | Markdown-based pages | Sprint 3 |
| **Notifications** | In-app notification system | Sprint 3 |
| **Background Jobs** | Postgres-backed queue, worker process, retry, status API | Sprint 2 |
| **Privacy/Legal** | Privacy policy, terms pages | Sprint 4 |
| **E2E Tests** | Auth, payments, dashboard flows | Sprint 4 |
| **Deployment** | Docker build, Google Cloud Run, CI pipeline | Sprint 4 |

The template uses **RuVector-Postgres** as its database. For standard CRUD (users, subscriptions, logs), it behaves like normal Postgres.

---

## 4. Development Plan

### Sprint 1 (Week 1-2): Foundation

**Deliverables:**
- Vite + React 18 + TypeScript strict mode scaffold
- Tailwind CSS + shadcn/ui setup (copy in button, dialog, input, card, dropdown, toast, etc.)
- CSS variables for theming, next-themes for dark/light toggle
- App.tsx with provider nesting (QueryClient → Tooltip → Toaster + Sonner → Router)
- Auth: email/password signup/login, Google OAuth, email verification, password reset, JWT sessions
- RBAC: admin/user roles, route guard component, API middleware
- API key system: generate, revoke, scope per key
- Database schema in RuVector-Postgres: users, sessions, api_keys, roles
- Dashboard layout: sidebar from config array, header with user menu, main content area
- Dark/light mode toggle in header

### Sprint 2 (Week 3-4): Core Features

**Deliverables:**
- Stripe integration: 3 tiers, checkout flow, customer portal link, webhook handlers, subscription status in DB
- Admin dashboard page: user management table with search, revenue chart (Recharts), activity log, daily stats cron job
- User dashboard page: profile form (React Hook Form + Zod), settings, subscription status card, API key management
- Background job runner: jobs table in Postgres, worker process, exponential backoff retry, dead letter handling, status API
- Notification system: notifications table, real-time updates via SSE or WebSocket, bell icon with unread count

### Sprint 3 (Week 5-6): Landing & Standard Features

**Deliverables:**
- Landing page: hero section, 6-item features grid, pricing table (reads from Stripe tiers), testimonials carousel, CTA section, footer with links, fully responsive
- Scroll reveal animations (Framer Motion `whileInView`)
- Transactional email: welcome on signup, password reset link, subscription confirmation (Resend or AWS SES)
- File uploads: S3-compatible presigned URL flow, avatar upload on profile page
- SEO: meta tags component, OG tags, auto-generated sitemap, robots.txt, JSON-LD on landing page
- Cookie consent banner with preference storage
- Analytics: page view tracking, basic behavior events
- Blog/docs: markdown pages with frontmatter, listing page, individual post page
- Privacy policy and terms of service pages

### Sprint 4 (Week 7-8): Polish & Ship

**Deliverables:**
- E2E test suite (Playwright): auth flows, payment flows, dashboard navigation, admin panel
- Database seeding script for development
- Docker build optimized for Google Cloud Run
- CI pipeline (GitHub Actions): lint, typecheck, test, build, deploy
- Page transitions and micro-interactions (Framer Motion)
- Lighthouse audit pass (performance, accessibility, SEO)
- README: how to clone, configure env vars, run locally, deploy
- Example page showing how to add a new feature to the template

---

## 5. Technical Decisions

**React + Vite** — SPA dashboard, sub-second HMR, no SSR overhead. Ruv uses this for all React projects.

**RuVector-Postgres** — Standard Postgres. One database, one connection, one backup.

**Tailwind + shadcn/ui** — Ruv's consistent stack across vibing, infinity-ui, and component work. Primitives copied into project (no version lock-in). Radix underneath for accessibility.

**Local state + React Query** — Ruv pattern: `useState` for UI state, React Query for server state. No global store libraries.

**React Hook Form + Zod** — Ruv's form/validation stack across all projects.

**Postgres job queue** — Simple and good enough. No Redis dependency for a starter. Upgrade path exists if throughput demands it.

**SPARC methodology** — Structured phases (Specification → Pseudocode → Architecture → Refinement → Completion) for building each feature. Especially useful for non-trivial features where upfront design prevents rework.

---

## 6. How to Reuse the Template

```bash
# 1. Clone
git clone <edra-starter-url> my-new-project
cd my-new-project

# 2. Configure
cp .env.example .env
# Edit: Stripe keys, OAuth credentials, email provider, S3 bucket, database URL

# 3. Run
npm install
npm run dev
# Portal running at localhost:5173

# 4. Add a feature page
# Create src/pages/MyFeature.tsx
# Add route to App.tsx
# Add sidebar item to nav config

# 5. Deploy
docker build -t my-project .
# Push to GCR, done
```

For each new project: clone, swap env vars, remove pages you don't need, add pages you do. The sidebar nav is a config array — add or remove items in one place.

---

## 7. Risks & Speed

**Move fast by not building what exists.** Use shadcn/ui components as-is. Use Stripe's hosted checkout. Use Resend for email. Use S3-compatible storage. Don't build custom versions.

**Keep components small.** Ruv keeps components under 500 lines. If a component grows, split it. Self-contained components are easier to reuse across project clones.

**Ship the template before optimizing it.** Sprint 1-4 delivers a working portal. Performance tuning, advanced animations, and sophisticated analytics come after it's deployed and has users.

**What to avoid:**
- Inventing abstractions the Ruv stack doesn't use
- Building a framework on top of a framework
- Designing for scale before you have users

---

## 8. References

1. Anthropic. "Building Effective Agents." Anthropic Research Blog, 2025.

2. shadcn. "shadcn/ui: Beautifully Designed Components." shadcn Documentation, 2025.

3. Bessemer Venture Partners. "State of the Cloud 2025." BVP Cloud Index, 2025.

4. SPARC Framework. "Structured Development for Applications." SPARC Documentation, 2026.
