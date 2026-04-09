---
title: Getting Started
order: 2
slug: getting-started
---

# Getting Started

This guide walks you through setting up Edra for local development.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A Stripe account (for billing features)

## Installation

```bash
git clone https://github.com/your-org/edra-saas-starter.git
cd edra-saas-starter
npm install
```

## Environment Setup

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/edra
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_API_URL=http://localhost:3001
```

## Database Setup

Run migrations to create the database schema:

```bash
npm run db:migrate
```

Optionally seed with sample data:

```bash
npm run db:seed
```

## Start Development

Run the frontend and backend concurrently:

```bash
# Terminal 1 -- Frontend
npm run dev

# Terminal 2 -- Backend
npm run server
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3001`.
