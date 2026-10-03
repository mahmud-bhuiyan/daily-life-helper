import { Router } from 'express';
import {
  getAuthMe,
  postChangePassword,
  postLogin,
  postLogout,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { changePasswordSchema, loginSchema } from '../validators/auth.validator.js';

export const authRoutes = Router();

/**
 * POST /api/v1/auth/login
 * Auth: none — sets httpOnly JWT cookie on success.
 */
authRoutes.post('/auth/login', validate({ body: loginSchema }), postLogin);

/**
 * POST /api/v1/auth/logout
 * Auth: required — clears session cookie.
 */
authRoutes.post('/auth/logout', requireAuth, postLogout);

/**
 * GET /api/v1/auth/me
 * Auth: required — returns current user profile.
 */
authRoutes.get('/auth/me', requireAuth, getAuthMe);

/**
 * POST /api/v1/auth/change-password
 * Auth: required — updates password, returns 204.
 */
authRoutes.post(
  '/auth/change-password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  postChangePassword,
);
