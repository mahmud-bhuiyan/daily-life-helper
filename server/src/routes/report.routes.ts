import { Router } from 'express';
import {
  getByCategoryReport,
  getSummaryReport,
  getTopItemsReport,
} from '../controllers/report.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  dateRangeReportQuerySchema,
  summaryReportQuerySchema,
  topItemsReportQuerySchema,
} from '../validators/report.validator.js';

export const reportRoutes = Router();

reportRoutes.use(requireAuth);

/**
 * GET /api/v1/reports/summary — totals + time buckets by period.
 */
reportRoutes.get(
  '/reports/summary',
  validate({ query: summaryReportQuerySchema }),
  getSummaryReport,
);

/**
 * GET /api/v1/reports/by-category — category breakdown for date range.
 */
reportRoutes.get(
  '/reports/by-category',
  validate({ query: dateRangeReportQuerySchema }),
  getByCategoryReport,
);

/**
 * GET /api/v1/reports/top-items — top items by spend in date range.
 */
reportRoutes.get(
  '/reports/top-items',
  validate({ query: topItemsReportQuerySchema }),
  getTopItemsReport,
);
