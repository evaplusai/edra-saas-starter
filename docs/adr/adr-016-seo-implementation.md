# ADR-016: SEO Implementation

**Date:** 2026-04-09
**Status:** Accepted

## Context

The template is a single-page application. SPAs do not serve pre-rendered HTML by default, which means search engine crawlers see an empty page unless explicit SEO handling is added. The template has two categories of pages: public (landing page, blog, pricing) that need SEO, and private (dashboard, settings, admin) that do not.

Google's crawler can execute JavaScript and index SPA content, but it is slower and less reliable than indexing static HTML. For the template's public pages — which are relatively static — the priority is correct meta tags, structured data, and a sitemap. Full SSR is not justified for this use case and would add significant complexity to the build and deployment pipeline.

The approach is a reusable `SEOHead` component that sets page-specific meta tags (title, description, Open Graph, Twitter Card) using React Helmet or an equivalent library. A build-time script generates `sitemap.xml` from known routes and blog post slugs. JSON-LD structured data on the landing page and blog posts gives search engines explicit entity information.

## Decision

Use React Helmet (or equivalent) for per-page meta tag management via a reusable `SEOHead` component. Generate `sitemap.xml` at build time from a static route list plus blog post slugs. Serve `robots.txt` as a static file. Add JSON-LD structured data (Organization, BlogPosting schemas) to the landing page and blog posts.

## Consequences

### Positive
- Public pages have complete meta tags, Open Graph data, and structured data without SSR
- `SEOHead` component provides a single place to manage SEO per route — consistent and hard to forget
- Sitemap generation is automated at build time, so it stays current with route changes
- No SSR infrastructure required — keeps deployment simple (static hosting works)

### Negative
- SPA content relies on Google's JavaScript rendering, which is slower to index than static HTML
- Sitemap generation requires a manual step to register new public routes in the route list
- No server-side rendering means social media link previews depend on meta tag injection working correctly

### Risks
- Search engines other than Google may not render JavaScript well — mitigated by keeping critical public content (landing, pricing) as simple as possible with minimal dynamic loading
- Blog post meta tags depend on data being available at render time — mitigated by loading blog metadata before rendering the SEOHead component
