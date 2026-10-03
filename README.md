# Daily Life Helper

Personal modular toolkit — **login + user management** (super admin), **expense tracking**, and **item price trends**.

## Stack

React 19 · Vite 8 · TanStack Query 5 · Node 24 LTS · Express 5 · PostgreSQL (Neon)

## Docs

| Document | Description |
|----------|-------------|
| [Implementation plan](docs/IMPLEMENTATION-PLAN.md) | Full spec, phases, and API reference |
| [OpenAPI spec](docs/openapi.yaml) | Import into Postman |

## Status

**Step 01 (Scaffold)** — complete. Next: Auth & user management.

## Quick start

Requires **Node 24** (`nvm use`).

```bash
# Server
cd server
cp .env.example .env    # DATABASE_URL, JWT_SECRET, super admin creds
npm install
npm run migrate
npm run dev             # http://localhost:4000

# Client
cd client
npm install
npm run dev             # http://localhost:5173
```

**Postman:** import `docs/openapi.yaml`
