import { query } from '../config/db.js';
import type { ReportPeriod } from '../validators/report.validator.js';

type BucketRow = {
  bucket_start: Date;
  total_minor: string;
};

export type ReportBucket = {
  periodStart: string;
  totalMinor: number;
};

const bucketQuery = (period: ReportPeriod) => {
  const trunc = period;
  return `
    SELECT date_trunc('${trunc}', spent_at) AS bucket_start,
           COALESCE(SUM(amount_minor), 0)::bigint AS total_minor
    FROM expenses
    WHERE user_id = $1
      AND spent_at >= $2::timestamptz
      AND spent_at <= $3::timestamptz
    GROUP BY 1
    ORDER BY 1
  `;
};

export const getSummaryBucketsForUser = async (
  userId: string,
  period: ReportPeriod,
  from: string,
  to: string,
): Promise<ReportBucket[]> => {
  const { rows } = await query(bucketQuery(period), [userId, from, to]);

  return (rows as BucketRow[]).map((row) => ({
    periodStart: row.bucket_start.toISOString(),
    totalMinor: Number(row.total_minor),
  }));
};

export const getTotalMinorForUser = async (
  userId: string,
  from: string,
  to: string,
): Promise<{ totalMinor: number; currency: string }> => {
  const { rows } = await query(
    `SELECT COALESCE(SUM(amount_minor), 0)::bigint AS total_minor,
            COALESCE(MAX(currency), 'BDT') AS currency
     FROM expenses
     WHERE user_id = $1
       AND spent_at >= $2::timestamptz
       AND spent_at <= $3::timestamptz`,
    [userId, from, to],
  );

  const row = rows[0] as { total_minor: string; currency: string };
  return {
    totalMinor: Number(row.total_minor),
    currency: row.currency,
  };
};

type CategoryRow = {
  category_id: string | null;
  category_name: string | null;
  color: string | null;
  total_minor: string;
};

export type CategorySpendRow = {
  categoryId: string | null;
  categoryName: string;
  color: string;
  totalMinor: number;
};

export const getSpendByCategoryForUser = async (
  userId: string,
  from: string,
  to: string,
): Promise<CategorySpendRow[]> => {
  const { rows } = await query(
    `SELECT e.category_id,
            c.name AS category_name,
            c.color,
            COALESCE(SUM(e.amount_minor), 0)::bigint AS total_minor
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id
       AND (c.user_id IS NULL OR c.user_id = e.user_id)
     WHERE e.user_id = $1
       AND e.spent_at >= $2::timestamptz
       AND e.spent_at <= $3::timestamptz
     GROUP BY e.category_id, c.name, c.color
     ORDER BY total_minor DESC`,
    [userId, from, to],
  );

  return (rows as CategoryRow[]).map((row) => ({
    categoryId: row.category_id,
    categoryName: row.category_name ?? 'Uncategorized',
    color: row.color ?? '#6366f1',
    totalMinor: Number(row.total_minor),
  }));
};

type TopItemRow = {
  item_id: string;
  item_name: string;
  total_minor: string;
  purchase_count: string;
};

export type TopItemSpendRow = {
  itemId: string;
  itemName: string;
  totalMinor: number;
  purchaseCount: number;
};

export const getTopItemsForUser = async (
  userId: string,
  from: string,
  to: string,
  limit: number,
): Promise<TopItemSpendRow[]> => {
  const { rows } = await query(
    `SELECT e.item_id,
            i.name AS item_name,
            COALESCE(SUM(e.amount_minor), 0)::bigint AS total_minor,
            COUNT(*)::int AS purchase_count
     FROM expenses e
     INNER JOIN items i ON i.id = e.item_id AND i.user_id = e.user_id
     WHERE e.user_id = $1
       AND e.item_id IS NOT NULL
       AND e.spent_at >= $2::timestamptz
       AND e.spent_at <= $3::timestamptz
     GROUP BY e.item_id, i.name
     ORDER BY total_minor DESC
     LIMIT $4`,
    [userId, from, to, limit],
  );

  return (rows as TopItemRow[]).map((row) => ({
    itemId: row.item_id,
    itemName: row.item_name,
    totalMinor: Number(row.total_minor),
    purchaseCount: Number(row.purchase_count),
  }));
};

export const countExpensesForUser = async (
  userId: string,
  from: string,
  to: string,
): Promise<number> => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count
     FROM expenses
     WHERE user_id = $1
       AND spent_at >= $2::timestamptz
       AND spent_at <= $3::timestamptz`,
    [userId, from, to],
  );

  return (rows[0] as { count: number }).count;
};
