---
title: Getting Started with Edra
date: 2026-04-01
slug: getting-started
excerpt: Learn how to set up your Edra SaaS project from scratch and deploy your first application in minutes.
author: Edra Team
---

# Getting Started with Edra

Welcome to Edra! This guide will walk you through setting up your SaaS application from scratch.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or later)
- **npm** or **yarn**
- A **PostgreSQL** database

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/edra-saas-starter.git
cd edra-saas-starter
npm install
```

## Configuration

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Update the following variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | A secure random string for JWT signing |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |

## Running the Application

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Next Steps

- Configure your [subscription plans](/docs/configuration)
- Set up [authentication providers](/docs/getting-started)
- Explore the [admin dashboard](/dashboard/admin)

Happy building!
