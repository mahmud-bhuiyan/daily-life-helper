import type { Request, Response } from 'express';
import { checkHealth } from '../services/health.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = await checkHealth();
  sendSuccess(res, health);
});
