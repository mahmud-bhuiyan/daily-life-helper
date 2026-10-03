# Daily Life Helper — Implementation Plan

> Personal modular toolkit. **Phase 1:** expense tracking with time-based and item-price charts.  
> Stack: **React · Node · Express · PostgreSQL (Neon)** — no extras.

---

## 1. Product goal

Track daily expenses, visualize spending over time, and see **item price trends** (e.g. onion price over the last 3 months).

**Principles**

| Priority | Rule |
|----------|------|
| Simplicity | One problem per file; no speculative abstractions |
| Less code | Reuse before rewrite; delete dead code immediately |
| Clarity | Readable names; comments only where intent is non-obvious |
| Growth | Module-ready folder layout for habits, tasks, etc. later |

**Not building (Phase 1):** multi-tenant SaaS, OAuth/social login, file uploads, mobile app, design system library.

---

## 2. Locked stack (minimal)

| Layer | Choice | Why |
|-------|--------|-----|
| Client | **React 19.3 + Vite 8 + TS 7** | Latest stable; fast dev, standard tooling |
| Routing | **React Router 7** | Client-side routes, loaders optional later |
| Styling | **Tailwind CSS 4** | Utility-first via `@tailwindcss/vite` |
| Charts | **Recharts 3.10** | React 19–compatible charts; enough for line/bar/pie |
| Server | **Node 24 LTS + Express 5 + TS 7** | Latest stable LTS runtime; simple REST API |
| DB | **PostgreSQL on Neon** | Managed Postgres, free tier, connection pooling |
| DB access | **`pg` (node-postgres)** | Direct SQL — no ORM overhead |
| Validation | **Zod 4** | Shared shape checks on API input |
| Dates | **date-fns 4** | Light date grouping (day/week/month/year) |
| Auth | **bcrypt 6 + JWT (httpOnly cookie)** | Email/password login; no OAuth, no session store |
| Server state | **TanStack Query 5.104** | Cached API data; background refetch with **no visible refresh** |

**Intentionally excluded:** Redux, Prisma, NestJS, shadcn full kit, Docker (until deploy needs it), Passport, OAuth providers.

**Folders:** always `client/` and `server/` — never `frontend/` or `backend/`.

### Version policy (latest stable only)

1. **Stable releases only** — no `-alpha`, `-beta`, `-rc`, or `next` tags.
2. **Install at scaffold:** `npm install <pkg>@latest` (or `npm create vite@latest` for client). Let lockfile capture exact versions.
3. **Ranges in `package.json`:** use `^` (semver-compatible). Never hard-pin old majors (e.g. `react@18`).
4. **Re-check before each implementation step:** `npm outdated` in `client/` and `server/`; bump patch/minor freely, majors only when planned.
5. **Runtime:** **Node 24 LTS** (Active LTS, Oct 2026). Add `.nvmrc` (`24`) and `"engines": { "node": ">=24 <25" }` in both `package.json` files.
6. **Tailwind 4:** use `@tailwindcss/vite` plugin — not the legacy PostCSS-only v3 setup.

**Pinned at plan date (2026-10-03)** — verify with `npm view <pkg> version` when scaffolding:

| Package | Version | Where |
|---------|---------|-------|
| Node.js | **24.x LTS** | runtime |
| TypeScript | **7.0.2** | client + server |
| react / react-dom | **19.3.0** | client |
| vite | **8.3.2** | client |
| @vitejs/plugin-react | **6.1.1** | client |
| react-router-dom | **7.18.4** | client |
| @tanstack/react-query | **5.104.1** | client |
| recharts | **3.10.1** | client |
| tailwindcss | **4.3.3** | client |
| @tailwindcss/vite | **4.3.3** | client |
| express | **5.2.1** | server |
| pg | **8.23.1** | server |
| zod | **4.6.5** | server |
| date-fns | **4.4.0** | client + server |
| bcrypt | **6.0.0** | server |
| jsonwebtoken | **9.0.3** | server |
| cors | **2.8.6** | server |
| cookie-parser | **1.4.7** | server |
| tsx | **4.23.15** | server (dev) |

Type packages (`@types/*`) — latest matching the library major at install time.

---

## 3. Architecture

```text
Browser (React SPA)
    │  fetch /api/v1/...  (credentials: include — JWT httpOnly cookie)
    ▼
Express API
    │  requireAuth → requireSuperAdmin (admin routes only)
    ▼
  pg pool  ──►  Neon PostgreSQL
```

- API prefix: `/api/v1`
- Client dev proxy: Vite → `http://localhost:4000`
- Env: `server/.env` (DATABASE_URL, JWT_SECRET, bootstrap admin), `client/.env` (optional VITE_API_URL for prod)
- **Multi-user, single app:** each user sees only their own data. All expense routes scoped by `user_id` from the session.
- **Roles:** `user` (default) and `super_admin`. Super admin manages users **and** uses the app like any user (own expenses, dashboard, items).

---

## 3.1 Auth & roles

| Role | Can do |
|------|--------|
| `user` | Login; CRUD own expenses, categories, items; view own reports |
| `super_admin` | Everything a `user` can do **plus** create/edit/deactivate users |

**Super admin as user:** one account, two hats. When on Dashboard / Expenses / Items, they act as a normal user (`user_id` on their row). Admin screens (`/admin/users`) are an extra sidebar section, not a separate login.

**Bootstrap:** on first migration/seed, create one `super_admin` from env (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`). No public sign-up — only super admin creates accounts.

**Session flow:**

1. `POST /auth/login` → verify bcrypt hash → set `token` httpOnly cookie (JWT, 7-day expiry).
2. `GET /auth/me` → return `{ id, email, displayName, role }` for UI.
3. `POST /auth/logout` → clear cookie.
4. Protected routes: `requireAuth` reads cookie, attaches `req.user`. Missing/invalid → `401`.

**Client:** `AuthProvider` + `useAuth`; unauthenticated users redirect to `/login`. `api.ts` sends `credentials: 'include'`.

---

## 3.2 Data fetching (TanStack Query — no visible refresh)

All API reads go through **TanStack Query v5**. Goal: first visit may show a skeleton; **every refetch after that is silent** — cached data stays on screen while fresh data loads in the background.

### Global defaults (`lib/queryClient.ts`)

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,              // 1 min — treat data as fresh
      gcTime: 10 * 60_000,            // keep cache 10 min after unmount
      refetchOnWindowFocus: true,     // background sync on tab focus
      refetchOnReconnect: true,
      retry: 1,
    },
  },
})
```

### Loading UI rule (non-negotiable)

| State | UI |
|-------|-----|
| `isPending && !data` | Skeleton / spinner (first load only) |
| `isFetching && data` | **Show cached data — no spinner, no flash** |
| `isError && !data` | Error state + retry |
| `isError && data` | Keep showing stale data; toast or inline banner optional |

Never bind loading skeletons to `isFetching` alone. `ChartShell`, tables, and summary cards follow this rule.

### Query hooks

- One hook per domain in `hooks/queries/` (e.g. `useExpenses`, `useReportSummary`).
- Central query keys in `lib/queryKeys.ts`.
- Filter/pagination queries use `placeholderData: keepPreviousData` so changing period or page does not blank the UI.

### Mutations

- Use `useMutation` for POST/PATCH/DELETE.
- On success: `queryClient.invalidateQueries({ queryKey: … })` — lists update in background without full-page loading.
- Prefer **optimistic updates** for expense edit/delete when trivial; otherwise invalidate related keys.

### Auth integration

- `GET /auth/me` → `useAuth` backed by `useQuery(['auth', 'me'])`.
- On `401` from any query: clear cache, redirect to `/login` (global `QueryCache` `onError` or `api.ts` interceptor).

---

## 4. Database schema

Money stored as **integer paise/cents** (`amount_minor BIGINT`) — never JS floats.

```sql
-- users: login accounts
CREATE TYPE user_role AS ENUM ('user', 'super_admin');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'user',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- categories: per-user (Food, Transport, Bills, ...)
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- items: per-user normalized product names (Onion, Rice, Milk)
CREATE TABLE items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  unit       TEXT,                    -- kg, pcs, L (optional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- expenses: core ledger (always owned by one user)
CREATE TABLE expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency     TEXT NOT NULL DEFAULT 'BDT',
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  item_id      UUID REFERENCES items(id) ON DELETE SET NULL,
  quantity     NUMERIC(12, 3),        -- e.g. 0.5 kg
  unit_price   NUMERIC(12, 2),        -- price per unit at purchase time
  note         TEXT,
  spent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_user_spent_at ON expenses (user_id, spent_at DESC);
CREATE INDEX idx_expenses_item_id ON expenses (user_id, item_id, spent_at DESC);
CREATE INDEX idx_expenses_category_id ON expenses (user_id, category_id);
CREATE INDEX idx_categories_user_id ON categories (user_id);
CREATE INDEX idx_items_user_id ON items (user_id);
```

**Scoping rule:** every query on categories, items, expenses **must** filter `WHERE user_id = $currentUserId`. Admin user-list queries are the only exception.

**Item price graph:** query `expenses` where `user_id = ? AND item_id = ?`, plot `unit_price` (or `amount_minor / quantity`) over `spent_at`.

**Seed data:**

1. Bootstrap `super_admin` user from env (see §13).
2. On first login (or user creation), seed default categories for that user: Food, Transport, Utilities, Shopping, Health, Other.

---

## 5. API design

All routes under `/api/v1`. JSON in/out. Errors: `{ "error": "message" }` with proper HTTP status.

Routes below marked **auth** require a valid session. **admin** requires `super_admin` role.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | — | `{ email, password }` → sets httpOnly cookie |
| POST | `/auth/logout` | auth | Clears session cookie |
| GET | `/auth/me` | auth | Current user profile |
| POST | `/auth/change-password` | auth | `{ currentPassword, newPassword }` |

### Admin — users (super_admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | admin | List all users (id, email, displayName, role, isActive, createdAt) |
| POST | `/admin/users` | admin | Create `{ email, password, displayName, role? }` — default role `user` |
| PATCH | `/admin/users/:id` | admin | Update displayName, role, isActive, or `password` (reset) |
| DELETE | `/admin/users/:id` | admin | Soft-delete: set `is_active = false` (cannot deactivate self) |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | auth | List current user's categories |
| POST | `/categories` | auth | Create `{ name, color? }` |

### Items

| Method | Path | Description |
|--------|------|-------------|
| GET | `/items` | auth | List current user's items (`?search=onion`) |
| POST | `/items` | auth | Create `{ name, unit? }` |
| GET | `/items/:id/price-history` | auth | `{ from, to }` → time series for charts |

### Expenses

| Method | Path | Description |
|--------|------|-------------|
| GET | `/expenses` | auth | Paginated list; filters: `from`, `to`, `categoryId`, `itemId` |
| POST | `/expenses` | auth | Create expense |
| PATCH | `/expenses/:id` | auth | Update own expense |
| DELETE | `/expenses/:id` | auth | Hard delete own expense |

### Reports (aggregations — server-side SQL)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/reports/summary` | auth | `?period=day\|week\|month\|year&from&to` → totals + grouped buckets |
| GET | `/reports/by-category` | auth | Pie/bar data for date range |
| GET | `/reports/top-items` | auth | Most spent items in range |

**Validation:** Zod schemas in `server/src/validators/`. Request flow below.

---

## 6. Server folder layout

Layered Express structure (TypeScript + PostgreSQL — **not** MongoDB). SQL lives in `models/` (data access); business rules in `services/`; HTTP in `controllers/`.

```text
server/
├── src/
│   ├── config/
│   │   ├── db.ts                    # pg Pool (Neon)
│   │   ├── env.ts                   # Zod-validated env
│   │   └── cors.ts
│   ├── models/                      # entity types + parameterized SQL (no ORM)
│   │   ├── user.model.ts
│   │   ├── category.model.ts
│   │   ├── item.model.ts
│   │   └── expense.model.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── health.controller.ts
│   │   ├── docs.controller.ts
│   │   ├── admin/
│   │   │   └── user.controller.ts
│   │   ├── category.controller.ts
│   │   ├── item.controller.ts
│   │   ├── expense.controller.ts
│   │   └── report.controller.ts
│   ├── services/
│   │   ├── auth.service.ts          # login, password, session logic
│   │   ├── user.service.ts          # admin user management
│   │   ├── category.service.ts
│   │   ├── item.service.ts
│   │   ├── expense.service.ts
│   │   └── report.service.ts
│   ├── routes/
│   │   ├── index.ts                 # mounts all routers under /api/v1
│   │   ├── auth.routes.ts
│   │   ├── health.routes.ts
│   │   ├── docs.routes.ts
│   │   ├── admin/
│   │   │   └── user.routes.ts
│   │   ├── category.routes.ts
│   │   ├── item.routes.ts
│   │   ├── expense.routes.ts
│   │   └── report.routes.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # JWT cookie → req.user
│   │   ├── requireSuperAdmin.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts   # Zod body/query/params
│   │   └── rateLimiter.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── category.validator.ts
│   │   ├── item.validator.ts
│   │   └── expense.validator.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── asyncHandler.ts
│   │   └── generateToken.ts
│   ├── db/                          # migrations only (not runtime queries)
│   │   ├── migrate.ts
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── app.ts                       # Express setup (no listen)
│   └── server.ts                    # starts the server
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

### Request flow

```text
routes → middlewares (auth, validate, rateLimit) → controller → service → model (SQL) → JSON
```

| Layer | Responsibility |
|-------|----------------|
| **routes** | HTTP paths, mount middleware, call controller |
| **controllers** | Parse request, call service, set status + JSON (thin) |
| **services** | Business rules, orchestration, `user_id` scoping |
| **models** | Parameterized SQL + row types + DTO mapping |
| **validators** | Zod schemas |
| **middlewares** | Cross-cutting: auth, errors, validation, rate limit |

**Rules:**

- Controllers never import `pg` directly — go through service → model.
- Services never touch `req` / `res` — receive plain arguments.
- One domain = one route file + controller + service + model (+ validator).
- `asyncHandler` wraps async controllers; errors flow to `error.middleware.ts`.

---

## 7. Client folder layout

```text
client/
├── src/
│   ├── main.tsx               # QueryClientProvider, AuthProvider, Router
│   ├── App.tsx                # route table
│   ├── index.css              # Tailwind + CSS variables (theme tokens)
│   ├── lib/
│   │   ├── api.ts             # fetch wrapper, credentials: include
│   │   ├── queryClient.ts     # QueryClient + global defaults
│   │   ├── queryKeys.ts       # centralized query key factory
│   │   ├── format.ts          # money, dates
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── queries/           # useExpenses, useCategories, useReportSummary, …
│   │   ├── useAuth.ts         # session via useQuery(['auth','me'])
│   │   └── useDebouncedValue.ts
│   ├── context/
│   │   └── AuthProvider.tsx
│   ├── components/
│   │   ├── ui/                # reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── charts/            # reusable chart wrappers
│   │   │   ├── TimeSeriesChart.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   └── ChartShell.tsx  # title, loading, empty
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx    # Users link only if role === super_admin
│   │   │   ├── PageHeader.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── forms/
│   │       └── ExpenseForm.tsx
│   └── pages/
│       ├── login/
│       │   └── LoginPage.tsx
│       ├── admin/
│       │   └── users/
│       │       ├── UsersAdminPage.tsx
│       │       └── components/
│       │           ├── UserTable.tsx
│       │           └── UserFormModal.tsx
│       ├── dashboard/
│       │   ├── DashboardPage.tsx
│       │   └── components/
│       │       ├── PeriodToggle.tsx
│       │       └── SummaryCards.tsx
│       ├── expenses/
│       │   ├── ExpensesPage.tsx
│       │   └── components/
│       │       └── ExpenseTable.tsx
│       └── items/
│           ├── ItemsPage.tsx
│           └── components/
│               └── ItemPricePanel.tsx
├── package.json
└── vite.config.ts
```

**Page rule:** `*Page.tsx` composes hooks + components; no fetch logic inside UI components.

---

## 8. UI / design direction

**Aesthetic:** calm, personal finance — not corporate dashboard. Dark-friendly with one accent.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0f1419` | Page background |
| `--surface` | `#1a2332` | Cards, sidebar |
| `--accent` | `#22c55e` | Primary actions, positive trends |
| `--muted` | `#94a3b8` | Secondary text |
| Font | **DM Sans** (Google) | Headings + body |
| Radius | `12px` cards, `8px` inputs | Consistent softness |

**Layout:** login page (full-screen, no sidebar). Authenticated: left sidebar (Dashboard, Expenses, Items, **Users** for super_admin only, + future module stubs). Header shows display name + logout. Main area: page header + content grid.

**Charts:** Recharts inside `ChartShell` — skeleton only on first load (`isPending`); background refetch keeps the chart visible. Empty state when `!data?.length`.

**Uniqueness:** subtle gradient on summary cards; item price page shows sparkline + full chart; period toggle as pill segment control (Day | Week | Month | Year).

---

## 9. Reusable components (build once, use everywhere)

| Component | Responsibility |
|-----------|----------------|
| `Button` | variants: primary, ghost, danger; sizes sm/md |
| `Card` | surface + padding + optional header slot |
| `ChartShell` | title, subtitle, first-load skeleton only, empty, children chart |
| `PeriodToggle` | controlled period state for reports |
| `Money` | format minor units → `৳1,234.50` |
| `PageHeader` | title, description, action slot (e.g. Add expense) |
| `Modal` | focus trap, ESC close, used by ExpenseForm |
| `EmptyState` | icon + message + optional CTA |

Extract when duplicated **twice** — not before.

---

## 10. Coding standards

### General

1. **TypeScript strict** on client and server.
2. **Arrow functions** for components, handlers, helpers.
3. Comments explain **why**, not what (`// Neon pool: ssl required in prod`).
4. No commented-out code in commits.
5. Max ~150 lines per file; split when larger.

### Server

- Parameterized SQL only — in `models/`, never in controllers.
- Map DB rows to API DTOs in the model or service for that domain.
- `ApiError` + `error.middleware.ts` — controllers use `asyncHandler`, no per-route try/catch.
- New feature: add `*.routes.ts` → `*.controller.ts` → `*.service.ts` → `*.model.ts` (+ validator).

### Client

- `api.ts`: one `request<T>(path, options)` function; used inside query/mutation `queryFn`s.
- **TanStack Query** for all GETs; `useMutation` + `invalidateQueries` for writes.
- Loading UI: `isPending && !data` only — never flash on background `isFetching`.
- Forms: controlled inputs; validate before POST; mutation `onSuccess` closes modal + invalidates cache.

### Git commits

Short, imperative: `add expense list page`, `fix week grouping timezone`.

---

## 11. Implementation phases

### Step 01 — Scaffold

- [x] Init `server/` — Express 5, TS 7, pg, Zod 4, cors, bcrypt, jsonwebtoken, cookie-parser, tsx; `engines` + lockfile
- [x] Init `client/` — `npm create vite@latest` (react-ts), then `@latest` for all deps per §2 version table
- [x] Tailwind 4 via `@tailwindcss/vite`; React Router 7; TanStack Query 5
- [x] Root `.nvmrc` → `24`
- [x] `queryClient.ts`, `queryKeys.ts`, `QueryClientProvider` in `main.tsx`
- [x] Neon DB + connection test endpoint `GET /api/v1/health`
- [x] SQL migration runner + schema from §4 (includes `users` table)
- [x] Bootstrap super_admin from env; seed default categories on user create
- [x] `docs/openapi.yaml` for Postman import; API reference lives in this plan (§5)

### Step 02 — Auth & user management

- [ ] Auth routes: login, logout, me, change-password
- [ ] `requireAuth` + `requireSuperAdmin` middleware on all protected routes
- [ ] Admin user CRUD (`/admin/users`)
- [ ] `LoginPage`, `AuthProvider`, `ProtectedRoute`
- [ ] `UsersAdminPage` (super_admin): list, add user, deactivate, reset password
- [ ] Sidebar: show **Users** only for super_admin; logout in header

### Step 03 — Expenses CRUD

- [ ] Expense + category + item API routes
- [ ] `ExpenseForm` + `ExpensesPage` table with filters
- [ ] `lib/format.ts` for money display

### Step 04 — Time reports

- [ ] `/reports/summary` with period grouping
- [ ] `DashboardPage`: summary cards + `TimeSeriesChart`
- [ ] `PeriodToggle` (day/week/month/year)

### Step 05 — Item price tracking

- [ ] Link expense to item; store quantity + unit_price
- [ ] `ItemsPage`: search items, pick item → price history chart
- [ ] `/items/:id/price-history` API

### Step 06 — Polish

- [ ] Loading / error / empty states on all pages
- [ ] Responsive sidebar (collapse on mobile)
- [ ] README with local setup + Neon env instructions

### Later modules (placeholders in sidebar)

- Habits tracker
- Grocery list
- Budget goals
- Reminders

Each future module gets: `pages/<module>/`, `server/src/routes/<module>.routes.ts` (+ controller, service, model), own migration file.

---

## 12. Local development

**Requires Node 24 LTS** (`nvm use` reads `.nvmrc`).

```bash
# Server
cd server && cp .env.example .env   # DATABASE_URL from Neon
npm install && npm run dev          # port 4000

# Client
cd client && npm install && npm run dev   # port 5173, proxies /api

# Optional — check for newer stable patches
npm outdated
```

**Neon setup:** create project → copy pooled connection string → set `DATABASE_URL` in `server/.env`.

---

## 13. Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | server | Neon PostgreSQL connection string |
| `JWT_SECRET` | server | Secret for signing session JWT (min 32 chars) |
| `SUPER_ADMIN_EMAIL` | server | **Optional** — only for first migrate on empty DB |
| `SUPER_ADMIN_PASSWORD` | server | **Optional** — only for first migrate on empty DB |
| `SUPER_ADMIN_NAME` | server | **Optional** — defaults to `Super Admin` if bootstrap runs |
| `PORT` | server | Default `4000` |
| `VITE_API_URL` | client | Prod API origin; empty in dev (use proxy) |

---

## 14. Success criteria (Phase 1 done when)

1. Super admin can log in, create/deactivate users, and use expense features with their own data.
2. Regular users can log in and only see their own expenses, categories, items, and reports.
3. User can add/edit/delete expenses with category and optional item.
4. Dashboard shows spending chart for day, week, month, year.
5. Items page shows price trend for a selected product over a date range.
6. Refetching data (tab focus, filter change, after mutation) never blanks the UI or shows a full-page loader.
7. App runs locally against Neon with under 5s page loads.
8. Codebase follows this plan’s folder and component rules.

---

## 15. Agent / Cursor skills

Project skill lives at `.cursor/skills/dlh-project/SKILL.md` — agents must read it before implementing features in this repo.

---

*Last updated: 2026-10-03*
