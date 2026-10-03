import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/generateToken.js';

/** Reads JWT from httpOnly `token` cookie and attaches req.user. */
export const requireAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token || typeof token !== 'string') {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired session'));
  }
};
