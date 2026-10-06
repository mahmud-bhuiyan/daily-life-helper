import { query } from '../config/db.js';

type ExpenseRow = {
  id: string;
  user_id: string;
  amount_minor: string;
  currency: string;
  category_id: string | null;
  item_id: string | null;
  quantity: string | null;
  unit_price: string | null;
  note: string | null;
  spent_at: Date;
  created_at: Date;
  category_name: string | null;
  category_color: string | null;
  item_name: string | null;
};

export type Expense = {
  id: string;
  amountMinor: number;
  currency: string;
  categoryId: string | null;
  itemId: string | null;
  quantity: number | null;
  unitPrice: number | null;
  note: string | null;
  spentAt: string;
  createdAt: string;
  categoryName: string | null;
  categoryColor: string | null;
  itemName: string | null;
};

const toNumber = (value: string | null): number | null =>
  value === null ? null : Number(value);

const toExpense = (row: ExpenseRow): Expense => ({
  id: row.id,
  amountMinor: Number(row.amount_minor),
  currency: row.currency,
  categoryId: row.category_id,
  itemId: row.item_id,
  quantity: toNumber(row.quantity),
  unitPrice: toNumber(row.unit_price),
  note: row.note,
  spentAt: row.spent_at.toISOString(),
  createdAt: row.created_at.toISOString(),
  categoryName: row.category_name,
  categoryColor: row.category_color,
  itemName: row.item_name,
});

const expenseSelect = `
  e.id,
  e.user_id,
  e.amount_minor,
  e.currency,
  e.category_id,
  e.item_id,
  e.quantity,
  e.unit_price,
  e.note,
  e.spent_at,
  e.created_at,
  c.name AS category_name,
  c.color AS category_color,
  i.name AS item_name
`;

const expenseJoins = `
  FROM expenses e
  LEFT JOIN categories c ON c.id = e.category_id AND c.user_id = e.user_id
  LEFT JOIN items i ON i.id = e.item_id AND i.user_id = e.user_id
`;

export type ListExpensesFilters = {
  from?: string;
  to?: string;
  categoryId?: string;
  itemId?: string;
  page: number;
  limit: number;
};

export const listExpensesForUser = async (
  userId: string,
  filters: ListExpensesFilters,
): Promise<{ items: Expense[]; total: number }> => {
  const offset = (filters.page - 1) * filters.limit;

  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total
     ${expenseJoins}
     WHERE e.user_id = $1
       AND ($2::timestamptz IS NULL OR e.spent_at >= $2)
       AND ($3::timestamptz IS NULL OR e.spent_at <= $3)
       AND ($4::uuid IS NULL OR e.category_id = $4)
       AND ($5::uuid IS NULL OR e.item_id = $5)`,
    [
      userId,
      filters.from ?? null,
      filters.to ?? null,
      filters.categoryId ?? null,
      filters.itemId ?? null,
    ],
  );

  const total = (countRows[0] as { total: number }).total;

  const { rows } = await query(
    `SELECT ${expenseSelect}
     ${expenseJoins}
     WHERE e.user_id = $1
       AND ($2::timestamptz IS NULL OR e.spent_at >= $2)
       AND ($3::timestamptz IS NULL OR e.spent_at <= $3)
       AND ($4::uuid IS NULL OR e.category_id = $4)
       AND ($5::uuid IS NULL OR e.item_id = $5)
     ORDER BY e.spent_at DESC
     LIMIT $6 OFFSET $7`,
    [
      userId,
      filters.from ?? null,
      filters.to ?? null,
      filters.categoryId ?? null,
      filters.itemId ?? null,
      filters.limit,
      offset,
    ],
  );

  return {
    items: (rows as ExpenseRow[]).map(toExpense),
    total,
  };
};

export const findExpenseForUser = async (
  userId: string,
  expenseId: string,
): Promise<Expense | null> => {
  const { rows } = await query(
    `SELECT ${expenseSelect}
     ${expenseJoins}
     WHERE e.user_id = $1 AND e.id = $2`,
    [userId, expenseId],
  );

  const row = rows[0] as ExpenseRow | undefined;
  return row ? toExpense(row) : null;
};

export const createExpenseForUser = async (
  userId: string,
  input: {
    amountMinor: number;
    currency?: string;
    categoryId?: string;
    itemId?: string;
    quantity?: number;
    unitPrice?: number;
    note?: string;
    spentAt?: string;
  },
): Promise<Expense> => {
  const { rows } = await query(
    `INSERT INTO expenses (
       user_id, amount_minor, currency, category_id, item_id,
       quantity, unit_price, note, spent_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::timestamptz, now()))
     RETURNING id`,
    [
      userId,
      input.amountMinor,
      input.currency ?? 'BDT',
      input.categoryId ?? null,
      input.itemId ?? null,
      input.quantity ?? null,
      input.unitPrice ?? null,
      input.note ?? null,
      input.spentAt ?? null,
    ],
  );

  const id = (rows[0] as { id: string }).id;
  const expense = await findExpenseForUser(userId, id);
  if (!expense) {
    throw new Error('Failed to load created expense');
  }
  return expense;
};

export const updateExpenseForUser = async (
  userId: string,
  expenseId: string,
  fields: {
    amountMinor?: number;
    currency?: string;
    categoryId?: string | null;
    itemId?: string | null;
    quantity?: number | null;
    unitPrice?: number | null;
    note?: string | null;
    spentAt?: string;
  },
): Promise<Expense | null> => {
  const sets: string[] = [];
  const values: unknown[] = [userId, expenseId];
  let idx = 3;

  if (fields.amountMinor !== undefined) {
    sets.push(`amount_minor = $${idx++}`);
    values.push(fields.amountMinor);
  }
  if (fields.currency !== undefined) {
    sets.push(`currency = $${idx++}`);
    values.push(fields.currency);
  }
  if (fields.categoryId !== undefined) {
    sets.push(`category_id = $${idx++}`);
    values.push(fields.categoryId);
  }
  if (fields.itemId !== undefined) {
    sets.push(`item_id = $${idx++}`);
    values.push(fields.itemId);
  }
  if (fields.quantity !== undefined) {
    sets.push(`quantity = $${idx++}`);
    values.push(fields.quantity);
  }
  if (fields.unitPrice !== undefined) {
    sets.push(`unit_price = $${idx++}`);
    values.push(fields.unitPrice);
  }
  if (fields.note !== undefined) {
    sets.push(`note = $${idx++}`);
    values.push(fields.note);
  }
  if (fields.spentAt !== undefined) {
    sets.push(`spent_at = $${idx++}`);
    values.push(fields.spentAt);
  }

  if (sets.length === 0) {
    return findExpenseForUser(userId, expenseId);
  }

  const { rowCount } = await query(
    `UPDATE expenses SET ${sets.join(', ')}
     WHERE user_id = $1 AND id = $2`,
    values,
  );

  if (rowCount === 0) return null;
  return findExpenseForUser(userId, expenseId);
};

export const deleteExpenseForUser = async (
  userId: string,
  expenseId: string,
): Promise<boolean> => {
  const { rowCount } = await query(`DELETE FROM expenses WHERE user_id = $1 AND id = $2`, [
    userId,
    expenseId,
  ]);

  return rowCount !== null && rowCount > 0;
};
