# Daily Life Helper

Personal modular toolkit — **login + user management** (super admin), **expense tracking**, **time-based reports**, and **item price trends**.

## Stack

React 19 · Vite 8 · TanStack Query 5 · Node 24 LTS · Express 5 · PostgreSQL (Neon)

## Docs

| Document | Description |
|----------|-------------|
| [Implementation plan](docs/IMPLEMENTATION-PLAN.md) | Full spec, phases, API reference, **client state (Context + Query)** |
| [OpenAPI spec](docs/openapi.yaml) | Import into Postman |

## Status

**Phase 1 complete** — Steps 01–06 (scaffold through polish & responsive UI). Next: optional future modules (habits, grocery, etc.) in the plan.

## Quick start

Requires **Node 24** (`nvm use`).

```bash
# Server
cd server
cp .env.example .env    # DATABASE_URL, JWT_SECRET, super admin creds
npm install
npm run migrate
npm run dev             # http://localhost:4000
npm run test:api        # smoke-test all /api/v1 routes (server must be running)

# Client
cd client
npm install
npm run dev             # http://localhost:5173
```

### Neon database

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (`?sslmode=require`).
3. Set `DATABASE_URL` in `server/.env`.
4. Run `npm run migrate` once (creates schema + optional super admin from env).

### Environment (server)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Session signing secret (min 32 characters) |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | Optional — bootstrap first admin on empty DB |
| `PORT` | API port (default `4000`) |

See `server/.env.example` for the full list.

**Postman:** import `docs/openapi.yaml`

## Deploy on Vercel (separate projects)

Deploy `client/` and `server/` as **two Vercel projects** from the same repo. Set each project's **Root Directory** in Vercel to `client` or `server`.

### 1. Server (`server/`)

1. Import repo → Root Directory: `server`
2. **Environment variables** (Production + Preview):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon **pooled** connection string (`?sslmode=require`) |
| `JWT_SECRET` | Min 32 random characters |
| `CLIENT_URL` | Your client Vercel URL(s), comma-separated for previews |

3. Run migrations once against Neon (local or CI): `npm run migrate`
4. Deploy — Vercel auto-detects Express from `src/server.ts` (zero-config)

Health check: `https://<your-api>.vercel.app/api/v1/health`

### 2. Client (`client/`)

1. Import repo → Root Directory: `client`
2. **Environment variable** (Production):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://<your-api>.vercel.app` (no trailing slash) |

3. Deploy — Vite build outputs `dist/`; SPA rewrites are in `vercel.json`

### Cross-origin auth

Client and API are on different origins in production. JWT cookies use `Secure` + `SameSite=None` when configured. Set `CLIENT_URL` on the server to match the exact client origin(s).
