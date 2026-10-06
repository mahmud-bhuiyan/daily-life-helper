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

type PriceHistoryRow = {
  spent_at: Date;
  quantity: string | null;
  unit_price: string | null;
  amount_minor: string;
};

export type PriceHistoryPoint = {
  spentAt: string;
  unitPrice: number;
  quantity: number | null;
};

export type ItemPriceHistory = {
  itemId: string;
  points: PriceHistoryPoint[];
};

const resolveUnitPrice = (row: PriceHistoryRow): number | null => {
  if (row.unit_price !== null) {
    return Number(row.unit_price);
  }
  const quantity = row.quantity === null ? null : Number(row.quantity);
  if (quantity === null || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }
  return Number(row.amount_minor) / 100 / quantity;
};

export const getItemPriceHistoryForUser = async (
  userId: string,
  itemId: string,
  from: string,
  to: string,
): Promise<ItemPriceHistory> => {
  const { rows } = await query(
    `SELECT spent_at, quantity, unit_price, amount_minor
     FROM expenses
     WHERE user_id = $1
       AND item_id = $2
       AND spent_at >= $3::timestamptz
       AND spent_at <= $4::timestamptz
     ORDER BY spent_at ASC`,
    [userId, itemId, from, to],
  );

  const points: PriceHistoryPoint[] = [];
  for (const row of rows as PriceHistoryRow[]) {
    const unitPrice = resolveUnitPrice(row);
    if (unitPrice === null || !Number.isFinite(unitPrice)) {
      continue;
    }
    points.push({
      spentAt: row.spent_at.toISOString(),
      unitPrice,
      quantity: row.quantity === null ? null : Number(row.quantity),
    });
  }

  return { itemId, points };
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
