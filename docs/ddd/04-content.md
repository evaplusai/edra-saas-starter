# Content Context

## Overview

The Content context manages blog posts, documentation pages, and file uploads. It handles markdown rendering, slug generation, and S3-based file storage with presigned URLs.

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| BlogPost | A published or draft article with markdown content |
| DocPage | A documentation page organized in a hierarchy |
| FileUpload | A file stored in S3 with metadata tracked in the database |
| Slug | A URL-safe identifier derived from a title |
| Frontmatter | Structured metadata (title, date, tags) at the top of a markdown file |
| Presigned URL | A temporary S3 URL granting upload or download access |

## Entities

### BlogPost
- Fields: id, authorId, title, slug, content (markdown), excerpt, tags, status (draft/published), publishedAt, createdAt, updatedAt
- Invariants: Slug must be unique. A published post must have a title, content, and excerpt. Only the author or an admin can edit. publishedAt is set when status changes to published.

### DocPage
- Fields: id, slug, title, content (markdown), parentId, sortOrder, createdAt, updatedAt
- Invariants: Slug must be unique. parentId references another DocPage or null for root pages. sortOrder determines display sequence within a parent.

### FileUpload
- Fields: id, userId, filename, s3Key, mimeType, sizeBytes, purpose (avatar/attachment/content), createdAt
- Invariants: s3Key must be unique. sizeBytes must not exceed the tier-based limit. mimeType must be from the allowed set for the given purpose.

## Value Objects

### Slug
- Fields: value (string)
- Validation: Lowercase, alphanumeric with hyphens only. Max 200 characters. Generated from title, deduplicated with suffix if needed.

### Frontmatter
- Fields: title, date, tags, excerpt, author
- Validation: title is required. date must be a valid ISO 8601 string. tags is an array of strings.

### S3Key
- Fields: value (string)
- Validation: Must follow the pattern: {purpose}/{userId}/{uuid}/{filename}. Immutable after creation.

### MimeType
- Fields: value (string)
- Validation: Must be a valid IANA media type. Avatars allow image/jpeg, image/png, image/webp. Attachments allow additional types including application/pdf.

## Aggregates

### BlogPost (Root: BlogPost)
- Contains: standalone
- Invariants: A draft can be freely edited. A published post creates a new revision on edit. Deleting a published post sets status to "archived" instead of hard-deleting.

### FileUpload (Root: FileUpload)
- Contains: standalone
- Invariants: Files are immutable after upload -- metadata can be updated but the binary cannot be replaced. Deleting a FileUpload also removes the S3 object.

## Domain Events

| Event | Trigger | Data |
|-------|---------|------|
| PostPublished | BlogPost status changes to published | postId, authorId, slug, publishedAt |
| FileUploaded | File upload completes | fileId, userId, s3Key, mimeType, sizeBytes |

## Repository Interfaces

### ContentRepository
- findById(id): BlogPost | null
- findBySlug(slug): BlogPost | null
- findPublished(pagination): BlogPost[]
- findByAuthor(authorId, pagination): BlogPost[]
- create(post): BlogPost
- update(id, fields): BlogPost
- delete(id): void
- findDocBySlug(slug): DocPage | null
- listDocs(parentId): DocPage[]

### FileRepository
- findById(id): FileUpload | null
- findByUserId(userId): FileUpload[]
- create(file): FileUpload
- delete(id): void
- findByS3Key(s3Key): FileUpload | null

## Domain Services

### FileUploadService
- generatePresignedUploadUrl(userId, filename, mimeType, purpose): Validates file type and size limits for the user's tier, generates S3Key, returns presigned PUT URL.
- generatePresignedDownloadUrl(s3Key): Returns a time-limited GET URL for the file.
- handleAvatarUpload(userId, file): Resizes image, uploads to S3, updates User avatarUrl.
- deleteFile(fileId): Removes S3 object and database record.

### ContentService
- renderMarkdown(content): Converts markdown to sanitized HTML.
- generateSlug(title): Produces a URL-safe slug, appends suffix if duplicate exists.
- parseFrontmatter(raw): Extracts Frontmatter value object from raw markdown string.
