import { endOfWeek, format, startOfWeek, subDays, subMonths, subYears } from 'date-fns';
import {
  countExpensesForUser,
  getSpendByCategoryForUser,
  getSummaryBucketsForUser,
  getTopItemsForUser,
  getTotalMinorForUser,
  type CategorySpendRow,
  type ReportBucket,
  type TopItemSpendRow,
} from '../models/report.model.js';
import type {
  DateRangeReportQuery,
  ReportPeriod,
  SummaryReportQuery,
  TopItemsReportQuery,
} from '../validators/report.validator.js';

export type SummaryReport = {
  totalMinor: number;
  currency: string;
  expenseCount: number;
  buckets: Array<ReportBucket & { label: string }>;
  from: string;
  to: string;
  period: ReportPeriod;
};

const defaultRange = (period: ReportPeriod): { from: Date; to: Date } => {
  const to = new Date();
  const from = new Date();

  switch (period) {
    case 'day':
      from.setTime(subDays(to, 29).getTime());
      break;
    case 'week':
      from.setTime(subDays(to, 7 * 11).getTime());
      break;
    case 'month':
      from.setTime(subMonths(to, 11).getTime());
      break;
    case 'year':
      from.setTime(subYears(to, 4).getTime());
      break;
  }

  return { from, to };
};

const resolveRange = (
  period: ReportPeriod,
  fromInput?: string,
  toInput?: string,
): { from: string; to: string } => {
  if (fromInput && toInput) {
    return { from: fromInput, to: toInput };
  }

  const { from, to } = defaultRange(period);
  return { from: from.toISOString(), to: to.toISOString() };
};

const resolveDateRange = (
  query: DateRangeReportQuery,
): { from: string; to: string } => {
  if (query.from && query.to) {
    return { from: query.from, to: query.to };
  }

  const to = new Date();
  const from = subMonths(to, 1);
  return { from: from.toISOString(), to: to.toISOString() };
};

const bucketLabel = (period: ReportPeriod, periodStart: string): string => {
  const start = new Date(periodStart);

  switch (period) {
    case 'day':
      return format(start, 'MMM d');
    case 'week': {
      const weekEnd = endOfWeek(start, { weekStartsOn: 1 });
      return `${format(startOfWeek(start, { weekStartsOn: 1 }), 'MMM d')} – ${format(weekEnd, 'MMM d')}`;
    }
    case 'month':
      return format(start, 'MMM yyyy');
    case 'year':
      return format(start, 'yyyy');
  }
};

export const buildSummaryReport = async (
  userId: string,
  query: SummaryReportQuery,
): Promise<SummaryReport> => {
  const { from, to } = resolveRange(query.period, query.from, query.to);
  const buckets = await getSummaryBucketsForUser(userId, query.period, from, to);
  const totals = await getTotalMinorForUser(userId, from, to);
  const expenseCount = await countExpensesForUser(userId, from, to);

  return {
    totalMinor: totals.totalMinor,
    currency: totals.currency,
    expenseCount,
    from,
    to,
    period: query.period,
    buckets: buckets.map((bucket) => ({
      ...bucket,
      label: bucketLabel(query.period, bucket.periodStart),
    })),
  };
};

export const buildCategoryReport = async (
  userId: string,
  query: DateRangeReportQuery,
): Promise<CategorySpendRow[]> => {
  const { from, to } = resolveDateRange(query);
  return getSpendByCategoryForUser(userId, from, to);
};

export const buildTopItemsReport = async (
  userId: string,
  query: TopItemsReportQuery,
): Promise<TopItemSpendRow[]> => {
  const { from, to } = resolveDateRange(query);
  return getTopItemsForUser(userId, from, to, query.limit);
};
