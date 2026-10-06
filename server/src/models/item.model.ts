import { query } from '../config/db.js';

type ItemRow = {
  id: string;
  user_id: string;
  name: string;
  unit: string | null;
  created_at: Date;
};

export type Item = {
  id: string;
  name: string;
  unit: string | null;
  createdAt: string;
};

const toItem = (row: ItemRow): Item => ({
  id: row.id,
  name: row.name,
  unit: row.unit,
  createdAt: row.created_at.toISOString(),
});

export const listItemsForUser = async (
  userId: string,
  search?: string,
): Promise<Item[]> => {
  const hasSearch = search !== undefined && search.length > 0;

  const { rows } = await query(
    `SELECT id, user_id, name, unit, created_at
     FROM items
     WHERE user_id = $1
       AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%')
     ORDER BY name ASC
     LIMIT 50`,
    [userId, hasSearch ? search : null],
  );

  return (rows as ItemRow[]).map(toItem);
};

export const findItemForUser = async (userId: string, itemId: string): Promise<Item | null> => {
  const { rows } = await query(
    `SELECT id, user_id, name, unit, created_at
     FROM items
     WHERE user_id = $1 AND id = $2`,
    [userId, itemId],
  );

  const row = rows[0] as ItemRow | undefined;
  return row ? toItem(row) : null;
};

export const createItemForUser = async (
  userId: string,
  input: { name: string; unit?: string },
): Promise<Item> => {
  const { rows } = await query(
    `INSERT INTO items (user_id, name, unit)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, unit, created_at`,
    [userId, input.name, input.unit ?? null],
  );

  return toItem(rows[0] as ItemRow);
};
