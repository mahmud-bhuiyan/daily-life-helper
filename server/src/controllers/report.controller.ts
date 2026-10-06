import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import {
  buildCategoryReport,
  buildSummaryReport,
  buildTopItemsReport,
} from '../services/report.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  DateRangeReportQuery,
  SummaryReportQuery,
  TopItemsReportQuery,
} from '../validators/report.validator.js';

export const getSummaryReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query as unknown as SummaryReportQuery;
  const report = await buildSummaryReport(req.user.id, query);
  sendSuccess(res, report);
});

export const getByCategoryReport = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as unknown as DateRangeReportQuery;
    const rows = await buildCategoryReport(req.user.id, query);
    sendSuccess(res, rows);
  },
);

export const getTopItemsReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query as unknown as TopItemsReportQuery;
  const rows = await buildTopItemsReport(req.user.id, query);
  sendSuccess(res, rows);
});
