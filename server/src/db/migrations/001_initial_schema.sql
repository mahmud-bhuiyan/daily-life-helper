-- Daily Life Helper — initial schema (Step 01)
-- Money is stored as amount_minor (integer paisa/cents) — never use floats for currency.

CREATE TYPE user_role AS ENUM ('user', 'super_admin');

-- ── Users ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'user',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Categories (per-user, unique name per user) ─────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ── Items (purchasable things tracked for price history) ────────────────────

CREATE TABLE IF NOT EXISTS items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  unit       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ── Expenses (core ledger — amount_minor is the source of truth) ────────────

CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency     TEXT NOT NULL DEFAULT 'BDT',
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  item_id      UUID REFERENCES items(id) ON DELETE SET NULL,
  quantity     NUMERIC(12, 3),
  unit_price   NUMERIC(12, 2),
  note         TEXT,
  spent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes (scoped by user_id for per-user queries) ────────────────────────

CREATE INDEX IF NOT EXISTS idx_expenses_user_spent_at ON expenses (user_id, spent_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_item_id ON expenses (user_id, item_id, spent_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses (user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items (user_id);

-- ── Migration tracking (managed by migrate.ts) ──────────────────────────────

CREATE TABLE IF NOT EXISTS schema_migrations (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
