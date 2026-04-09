---
title: Introduction
order: 1
slug: introduction
---

# Introduction

Edra is a modern SaaS starter kit built with React, TypeScript, and Tailwind CSS. It provides everything you need to launch a subscription-based application.

## Overview

Edra includes:

- **Authentication** -- Email/password login with JWT tokens
- **Authorization** -- Role-based access control (Admin, Member, Viewer)
- **Billing** -- Stripe integration for subscriptions
- **Dashboard** -- Pre-built admin and user dashboards
- **API** -- RESTful API with Express.js

## Architecture

The project follows a clean separation between frontend and backend:

```
src/
  components/   # Reusable UI components
  pages/        # Route-level page components
  hooks/        # Custom React hooks
  lib/          # Utility functions and API client
  server/       # Express.js backend
    db/         # Database migrations and queries
    routes/     # API route handlers
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui (Radix primitives) |
| Routing | React Router v7 |
| State | TanStack Query |
| Backend | Express.js |
| Database | PostgreSQL |
| Billing | Stripe |
