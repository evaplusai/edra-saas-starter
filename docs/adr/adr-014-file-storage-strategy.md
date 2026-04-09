# ADR-014: File Storage Strategy

**Date:** 2026-04-09
**Status:** Accepted

## Context

The template needs file upload support for user avatars and will likely need per-project file storage as teams extend it. Files should not flow through the application server — this adds latency, consumes server memory, and complicates horizontal scaling.

Presigned URLs solve this cleanly. The server generates a time-limited upload URL, the client uploads directly to object storage, and the server stores only the object key. Downloads work the same way — the server generates a presigned read URL on demand. The app server never touches file bytes.

The S3 API has become a de facto standard. AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO, and Backblaze B2 all implement the same API surface. By targeting the S3-compatible API rather than a vendor-specific SDK, the template works with any of these providers. Teams pick based on their cost, latency, and compliance requirements.

## Decision

Use S3-compatible object storage accessed exclusively through presigned URLs. The storage client uses the standard S3 SDK configured via environment variables (`S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`). No vendor-specific features are used. Image resizing and cropping happen client-side before upload.

## Consequences

### Positive
- Zero file bytes on the app server — upload and download go directly between client and storage
- Works with any S3-compatible provider with no code changes, only environment variable swaps
- Presigned URLs are time-limited and scoped to specific keys, reducing attack surface
- MinIO can run locally in Docker for development, eliminating cloud dependency during dev

### Negative
- Client-side image processing means the browser does resize/crop work — older devices may be slow
- No server-side file validation beyond content-type checks in the presigned URL policy
- Presigned URL expiration requires careful UX handling (upload must complete before URL expires)

### Risks
- Large file uploads over slow connections may exceed presigned URL TTL — mitigated by using multipart uploads for files over 10MB and setting generous TTLs (15 minutes)
- CORS misconfiguration on the bucket can silently break uploads — mitigated by including bucket CORS setup in the deployment guide
