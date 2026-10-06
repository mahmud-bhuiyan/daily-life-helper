import { query } from '../config/db.js';

type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: Date;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  color: row.color,
  createdAt: row.created_at.toISOString(),
});

export const listCategoriesForUser = async (userId: string): Promise<Category[]> => {
  const { rows } = await query(
    `SELECT id, user_id, name, color, created_at
     FROM categories
     WHERE user_id = $1
     ORDER BY name ASC`,
    [userId],
  );

  return (rows as CategoryRow[]).map(toCategory);
};

export const findCategoryForUser = async (
  userId: string,
  categoryId: string,
): Promise<Category | null> => {
  const { rows } = await query(
    `SELECT id, user_id, name, color, created_at
     FROM categories
     WHERE user_id = $1 AND id = $2`,
    [userId, categoryId],
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
     RETURNING id, user_id, name, color, created_at`,
    [userId, input.name, input.color ?? '#6366f1'],
  );

  return toCategory(rows[0] as CategoryRow);
};
