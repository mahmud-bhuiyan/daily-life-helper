import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';

/** Must run after requireAuth — rejects non super_admin roles with 403. */
export const requireSuperAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'super_admin') {
    next(new ApiError(403, 'Super admin access required'));
    return;
  }
  next();
};
