import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { failure } from '../utils/apiResponse.js';

/**
 * Global error handler — all API errors use the universal envelope:
 * `{ success: false, error: string }`
 */
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(failure(err.message));
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((i) => i.message).join('; ');
    res.status(400).json(failure(message));
    return;
  }

  console.error(err);
  res.status(500).json(failure('Internal server error'));
};
