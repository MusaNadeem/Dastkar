# Arts & Crafts Marketplace

A web marketplace connecting independent Pakistani artists and craftspeople with buyers. Sellers list handmade products and accept custom commissions; buyers browse, purchase (simulated payments in MVP), and track orders. Replaces the Instagram-DM / WhatsApp selling model with structured listings, order management, and IP protection.

## Documentation

| Doc | Purpose |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Build guide + **locked MVP decisions** (source of truth for scope) |
| [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) | Full business context (problem, market, model, IP, GTM) |
| [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) | End-to-end engineering plan, sprint detail, definition of done |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Week-by-week MVP + months 2–24 growth roadmap |
| [`docs/QA_GUIDELINES.md`](docs/QA_GUIDELINES.md) | QA gates for every sprint/phase |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Table definitions + RLS baseline |
| [`docs/API_SPEC.md`](docs/API_SPEC.md) | Endpoint contract (kept in sync as routes are built) |

## Stack

React (Vite) · Node.js + Express · PostgreSQL via Supabase (auth + storage + RLS) · Supabase Google OAuth · simulated payments (MVP) · Vercel + Railway hosting.

## Getting started

```bash
cp .env.example .env        # fill in Supabase keys
npm install                 # installs both workspaces
npm run dev:api             # Express on :4000
npm run dev:web             # Vite dev server
```

Run the migrations in `apps/api/src/db/migrations/` against your Supabase project (SQL editor or CLI), then seed categories.

## Repository layout

```
apps/
  web/    React frontend (Vite) → Vercel
  api/    Express backend       → Railway
docs/     Planning + reference documentation
```

See `docs/DEVELOPMENT_PLAN.md` for the full architecture and build order.
# Dastkar
