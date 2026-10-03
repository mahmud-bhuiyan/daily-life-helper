---
name: dlh-project
description: >-
  Daily Life Helper project conventions. Use when implementing features,
  fixing bugs, or scaffolding code in the daily-life-helper repository.
  React + Express + PostgreSQL (Neon), minimal stack, less code better output.
---

# Daily Life Helper — Project Skill

Read `docs/IMPLEMENTATION-PLAN.md` for full spec. This skill captures non-negotiable conventions.

## Stack (do not add libraries without asking)

- **Runtime:** Node **24 LTS** — `.nvmrc` + `"engines": { "node": ">=24 <25" }`
- **Versions:** latest **stable** only (`npm install @latest`); no alpha/beta/rc; see §2 version table in plan
- **Client:** React 19, Vite 8, TypeScript 7, Tailwind 4 (`@tailwindcss/vite`), React Router 7, Recharts 3, TanStack Query 5
- **Server:** Express 5, TypeScript 7, `pg`, Zod 4, date-fns 4, bcrypt, jsonwebtoken, cookie-parser, tsx (dev)
- **Auth:** email/password, JWT in httpOnly cookie, roles `user` | `super_admin`
- **DB:** PostgreSQL on Neon — SQL migrations in `server/src/db/migrations/`
- **No:** Prisma, Redux, NestJS, shadcn full install, ORMs, OAuth, Passport

Folders: `client/` and `server/` only.

## Engineering mindset

Write like a 10-year veteran:

1. **Less code, best output** — smallest diff that solves the task
2. **Reuse** — extend `components/ui/*` and `lib/*` before creating new primitives
3. **Readable** — clear names; comments only for non-obvious intent (why, not what)
4. **No redundancy** — delete unused code; no copy-paste handlers
5. **Layered server** — routes → controller → service → model (SQL); controllers stay thin

## Server patterns

```
routes → middlewares → controller → service → model (SQL) → JSON
```

- Entry: `server.ts` listens; `app.ts` mounts `routes/index.ts` at `/api/v1`
- Folders: `config/`, `models/`, `controllers/`, `services/`, `routes/`, `middlewares/`, `validators/`, `utils/`, `db/migrations/`
- API prefix: `/api/v1`
- Auth: `auth.middleware.ts` on data routes; `requireSuperAdmin.middleware.ts` on `/admin/*`
- Data scoping: services/models filter `user_id` — never trust client-sent user id
- Money: `amount_minor` as integer; never float math for currency
- SQL: parameterized queries in `models/` only
- Errors: `ApiError` + `error.middleware.ts`; async controllers use `asyncHandler`
- New domain: `*.routes.ts` + `*.controller.ts` + `*.service.ts` + `*.model.ts` + validator + migration

## Client patterns

- `App.tsx` = routes only; `main.tsx` = `QueryClientProvider`, `AuthProvider`, Router
- Unauthenticated → `/login`; admin routes gated by `role === 'super_admin'`
- Pages in `pages/<name>/` with local `components/` and hooks
- `*Page.tsx` stays thin — data via `hooks` (TanStack Query), not raw fetch
- `lib/api.ts` + `lib/queryKeys.ts`; mutations invalidate related keys
- **No visible refresh:** skeleton only when `isPending && !data`; keep showing cache during `isFetching`
- Filter/pagination: `placeholderData: keepPreviousData`
- Charts wrapped in `ChartShell` (first-load skeleton, empty, title)

## UI / design tokens

Use CSS variables from `index.css`:

- Background: `--bg`, surfaces: `--surface`, accent: `--accent`
- Font: DM Sans
- Modern, calm dark theme — not generic bootstrap look
- Import from barrel `index.ts` files — `components/ui`, `components/layout`, `types`, `hooks`, `context` — not individual files
- Reuse: `Button`, `Card`, `Modal`, `PageHeader`, `EmptyState`

### Tailwind 4 + CSS variables (required)

Use Tailwind v4 shorthand for theme tokens — **never** `[var(--token)]` in class names.

| Wrong | Correct |
|-------|---------|
| `bg-[var(--surface)]` | `bg-(--surface)` |
| `text-[var(--muted)]` | `text-(--muted)` |
| `border-[var(--border)]` | `border-(--border)` |
| `rounded-[var(--radius-card)]` | `rounded-(--radius-card)` |
| `min-w-[720px]` | `min-w-180` (use spacing scale, not `[Npx]`) |
| `shadow-[0_4px_24px_…]` | `@utility shadow-elevated` in `index.css`, then `shadow-elevated` |
| `text-[11px] tracking-[0.2em]` | `.text-overline` in `index.css` |
| `min-h-screen min-h-dvh` | Set `min-height: 100dvh` on `#root` in `index.css`; use `flex-1` on page wrappers |
| `min-h-screen` or `min-h-dvh` on pages | `flex-1` (viewport height lives on `#root` once) |

**Rule:** prefer Tailwind scale tokens (`min-w-180`, `pl-2.5`, `max-w-md`) and project `@utility` classes over arbitrary `[…]` values. Mobile-first layouts — no fixed pixel min-widths unless the view already switches to a card layout below `md`.

Before finishing client UI work: run `npm run build` and `npm run lint` in `client/` — zero Tailwind class warnings.

### React 19 event types (required)

React 19 `@types/react` deprecates types that don't match real DOM events. **Do not use deprecated event types** — fix warnings instead of ignoring them.

| Deprecated | Use instead |
|------------|-------------|
| `FormEvent` / `FormEventHandler` | `SubmitEvent` for `onSubmit`; `ChangeEvent` for `onChange`; `SyntheticEvent` otherwise |
| Bare `FormEvent` (no generic) | `SubmitEvent` (submitter + `HTMLFormElement` target are typed correctly) |

Match existing handlers (e.g. `LoginPage.tsx` uses `SubmitEvent` on form submit).

## Module growth

Future modules (habits, grocery, etc.) each get:

- `client/src/pages/<module>/`
- `server/src/routes/<module>.routes.ts` (+ controller, service, model)
- Own SQL migration file
- `user_id` scoping on all user-owned rows

Do not mix module logic into expense files. Admin UI lives under `pages/admin/`.

## Before marking work complete

1. TypeScript compiles with no errors; dependencies are latest stable (no prerelease tags)
2. New API routes documented in plan or inline route comment
3. Loading + error + empty states on new UI (no flash on background refetch)
4. Client lint/build clean — no Tailwind v4 class suggestion warnings
5. No secrets committed — use `.env.example`

## Reference

Full architecture, schema, API list, and phase checklist: `docs/IMPLEMENTATION-PLAN.md`
