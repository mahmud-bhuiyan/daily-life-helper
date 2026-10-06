import { z } from 'zod';

export const reportPeriodSchema = z.enum(['day', 'week', 'month', 'year']);

export const summaryReportQuerySchema = z.object({
  period: reportPeriodSchema,
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});

export const dateRangeReportQuerySchema = z.object({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});

export const topItemsReportQuerySchema = dateRangeReportQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type SummaryReportQuery = z.infer<typeof summaryReportQuerySchema>;
export type DateRangeReportQuery = z.infer<typeof dateRangeReportQuerySchema>;
export type TopItemsReportQuery = z.infer<typeof topItemsReportQuerySchema>;
export type ReportPeriod = z.infer<typeof reportPeriodSchema>;
