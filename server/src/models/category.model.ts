import { query } from '../config/db.js';

type CategoryRow = {
  id: string;
  user_id: string | null;
  name: string;
  color: string;
  created_at: Date;
};

export type CategoryScope = 'global' | 'user';

export type Category = {
  id: string;
  name: string;
  color: string;
  scope: CategoryScope;
  createdAt: string;
};

const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  color: row.color,
  scope: row.user_id === null ? 'global' : 'user',
  createdAt: row.created_at.toISOString(),
});

const categorySelect = `id, user_id, name, color, created_at`;

export const listCategoriesForUser = async (userId: string): Promise<Category[]> => {
  const { rows } = await query(
    `SELECT ${categorySelect}
     FROM categories
     WHERE user_id IS NULL OR user_id = $1
     ORDER BY (user_id IS NULL) DESC, name ASC`,
    [userId],
  );

  return (rows as CategoryRow[]).map(toCategory);
};

export const findCategoryForUser = async (
  userId: string,
  categoryId: string,
): Promise<Category | null> => {
  const { rows } = await query(
    `SELECT ${categorySelect}
     FROM categories
     WHERE id = $2 AND (user_id IS NULL OR user_id = $1)`,
    [userId, categoryId],
  );

  const row = rows[0] as CategoryRow | undefined;
  return row ? toCategory(row) : null;
};

export const findGlobalCategoryByName = async (
  name: string,
): Promise<Category | null> => {
  const { rows } = await query(
    `SELECT ${categorySelect}
     FROM categories
     WHERE user_id IS NULL AND lower(name) = lower($1)`,
    [name.trim()],
  );

  const row = rows[0] as CategoryRow | undefined;
  return row ? toCategory(row) : null;
};

export const createCategoryForUser = async (
  userId: string,
  input: { name: string; color?: string },
): Promise<Category> => {
  const { rows } = await query(
    `INSERT INTO categories (user_id, name, color)
     VALUES ($1, $2, $3)
     RETURNING ${categorySelect}`,
    [userId, input.name.trim(), input.color ?? '#6366f1'],
  );

  return toCategory(rows[0] as CategoryRow);
};

export const createGlobalCategory = async (
  input: { name: string; color?: string },
): Promise<Category> => {
  const { rows } = await query(
    `INSERT INTO categories (user_id, name, color)
     VALUES (NULL, $1, $2)
     RETURNING ${categorySelect}`,
    [input.name.trim(), input.color ?? '#6366f1'],
  );

  return toCategory(rows[0] as CategoryRow);
};

export const findCategoryRowById = async (
  categoryId: string,
): Promise<CategoryRow | null> => {
  const { rows } = await query(
    `SELECT ${categorySelect} FROM categories WHERE id = $1`,
    [categoryId],
  );

  return (rows[0] as CategoryRow | undefined) ?? null;
};

export const countExpensesWithCategory = async (categoryId: string): Promise<number> => {
  const { rows } = await query(
    `SELECT COUNT(*)::text AS count FROM expenses WHERE category_id = $1`,
    [categoryId],
  );

  return Number((rows[0] as { count: string }).count);
};

export const deleteCategoryById = async (categoryId: string): Promise<boolean> => {
  const { rowCount } = await query(`DELETE FROM categories WHERE id = $1`, [categoryId]);
  return (rowCount ?? 0) > 0;
};

export const updateCategoryRow = async (
  categoryId: string,
  fields: { name?: string; color?: string },
): Promise<Category | null> => {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${idx++}`);
    values.push(fields.name.trim());
  }
  if (fields.color !== undefined) {
    sets.push(`color = $${idx++}`);
    values.push(fields.color);
  }

  if (sets.length === 0) {
    const row = await findCategoryRowById(categoryId);
    return row ? toCategory(row) : null;
  }

  values.push(categoryId);
  const { rows } = await query(
    `UPDATE categories SET ${sets.join(', ')}
     WHERE id = $${idx}
     RETURNING ${categorySelect}`,
    values,
  );

  const row = rows[0] as CategoryRow | undefined;
  return row ? toCategory(row) : null;
};
