-- Global categories (user_id NULL) + per-user custom categories.

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_name_key;
ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_global_name
  ON categories (lower(name))
  WHERE user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_name
  ON categories (user_id, lower(name))
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_categories_global ON categories (name) WHERE user_id IS NULL;

-- Global catalog (idempotent)
INSERT INTO categories (user_id, name, color)
SELECT NULL, v.name, v.color
FROM (
  VALUES
    ('Food', '#22c55e'),
    ('Transport', '#3b82f6'),
    ('Utilities', '#f59e0b'),
    ('Shopping', '#a855f7'),
    ('Health', '#ef4444'),
    ('Entertainment', '#ec4899'),
    ('Education', '#8b5cf6'),
    ('Rent', '#78716c'),
    ('Insurance', '#0ea5e9'),
    ('Personal care', '#14b8a6'),
    ('Travel', '#06b6d4'),
    ('Subscriptions', '#6366f1'),
    ('Gifts', '#d946ef'),
    ('Home', '#84cc16'),
    ('Other', '#64748b')
) AS v(name, color)
WHERE NOT EXISTS (
  SELECT 1 FROM categories g WHERE g.user_id IS NULL AND lower(g.name) = lower(v.name)
);

-- Point expenses at global rows when a per-user row duplicated the same name.
UPDATE expenses e
SET category_id = g.id
FROM categories c
JOIN categories g
  ON g.user_id IS NULL AND lower(g.name) = lower(c.name)
WHERE e.category_id = c.id
  AND c.user_id IS NOT NULL;

DELETE FROM categories c
WHERE c.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM categories g
    WHERE g.user_id IS NULL AND lower(g.name) = lower(c.name)
  );
