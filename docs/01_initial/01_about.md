# edra-starter

A reusable SaaS starter kit built on the Ruv stack. Designed to be the foundation for multiple production projects — clone it, configure it, and start building your product features immediately. Follows Ruv development approach and SPARC methodology.

## Features

### Authentication
- Email/password login
- Email verification
- Password reset
- Google OAuth
- Login/signup pages
- Session management
- Protected routes

### Authorization
- Role-based access control (admin, user)
- Protected API routes by role
- Protected UI sections by role

### Subscription payments (Stripe only)
- Three subscription tiers (Free, Pro, Enterprise)
- Checkout flow
- Customer portal (upgrade, downgrade, cancel)
- Webhook handling for subscription lifecycle events
- Pricing page with tier comparison

### Landing page
- Hero section
- Features section
- Pricing section (connected to Stripe tiers)
- Testimonials
- Call-to-action
- Footer
- Mobile responsive

### User dashboard
- Sidebar navigation
- User profile and settings
- Subscription status and management

### Admin dashboard
- User management (view, search, edit, delete)
- Revenue and subscription analytics
- Activity logs
- Analytics pulled into admin dashboard (page views, sources)
- Daily stats background job

### Analytics
- Page view tracking
- User behavior tracking
- Session replay
- Funnel analysis

### SEO
- Meta tags and Open Graph tags
- Sitemap generation
- Robots.txt
- Structured data (JSON-LD)

### Email sending
- Transactional email sending
- Welcome email on signup
- Password reset email
- Subscription confirmation email

### File uploading
- File upload support (S3-compatible)
- User avatar upload

### Cookie consent
- Cookie consent modal
- User preference storage

### Dark/light mode
- Theme toggle
- Persisted user preference

### Animations
- Page transitions after login
- Scroll reveal animations on landing page
- Micro-interactions on dashboard

### Background jobs
- Daily stats calculation
- Scheduled tasks support

### Blog / documentation site
- Blog pages
- Documentation pages

### User messages / notifications
- In-app notification system
- User-facing messages

### Privacy and legal
- Privacy policy page

### Testing
- End-to-end tests
- Database seeding script

### Type safety
- End-to-end type safety across frontend and backend

### Deployment
- Containerized for cloud deployment
- Google Cloud Run ready
- Environment variable configuration
- One-command deploy

### Developer experience
- One-command setup
- Reusable across projects (clone, configure, build)
- Vibe coding friendly with Ruflo and SPARC
- Self-learning hooks for development optimization
- RuVector-Postgres as intelligent database layer
- SPARC development methodology