# ADR-012: Deployment Strategy

**Date:** 2026-04-09
**Status:** Accepted

## Context

The starter template needs a deployment strategy that is reproducible, portable, and cost-efficient for early-stage projects. Manual deployment via SSH or FTP is error-prone and does not scale. Platform-specific deployment (Vercel, Netlify) locks the project into a vendor's conventions and pricing.

Containerized deployment with Docker provides portability across cloud providers. Google Cloud Run was selected as the primary target because it scales to zero (no cost when idle), requires no cluster management (unlike GKE/ECS), and supports custom containers without opinionated build systems.

CI/CD should be automated from the start to prevent the common pattern of "we'll add CI later" that results in manual, error-prone deploys throughout the project's early life.

## Decision

Containerize the application with Docker. Deploy to Google Cloud Run as the primary target. Use GitHub Actions for the CI/CD pipeline with the following stages: lint, typecheck, test, build Docker image, push to Google Artifact Registry, deploy to Cloud Run.

All runtime configuration uses environment variables, never baked into the image. The Dockerfile uses a multi-stage build: Node.js for building, a minimal runtime image for serving. A single container serves both the static frontend and the API server.

Pipeline triggers:
- Push to `main` deploys to production
- Pull requests run lint, typecheck, and test only (no deploy)

## Consequences

### Positive
- Scale-to-zero on Cloud Run means near-zero cost for low-traffic starters
- Docker image is portable to any container platform (AWS ECS, Fly.io, Railway)
- Automated CI pipeline catches issues before they reach production
- Environment variables keep secrets out of the image and version control

### Negative
- Docker knowledge is required to customize the build or debug container issues
- Google Cloud Run billing can surprise if traffic spikes without spending limits configured
- Multi-stage Docker builds add complexity compared to platform-native deploys

### Risks
- **Cold start latency on scale-to-zero.** Mitigation: set minimum instances to 1 for production if latency-sensitive, or use Cloud Run's CPU-always-allocated mode.
- **Vendor lock-in to GCR-specific features.** Mitigation: keep the Dockerfile standard and Cloud Run config minimal; document alternative deploy targets in the README.
- **CI pipeline secrets exposure.** Mitigation: use GitHub Actions secrets for all credentials, never echo them in logs, and restrict secret access to the `main` branch.
