import { Router } from 'express';
import {
  deleteUser,
  listUsers,
  patchUser,
  postUser,
} from '../../controllers/admin/user.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireSuperAdmin } from '../../middlewares/requireSuperAdmin.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../../validators/user.validator.js';

export const adminUserRoutes = Router();

const adminOnly = [requireAuth, requireSuperAdmin] as const;

/**
 * GET /api/v1/admin/users — list all users (super_admin only).
 */
adminUserRoutes.get('/admin/users', ...adminOnly, listUsers);

/**
 * POST /api/v1/admin/users — create user + seed default categories.
 */
adminUserRoutes.post(
  '/admin/users',
  ...adminOnly,
  validate({ body: createUserSchema }),
  postUser,
);

/**
 * PATCH /api/v1/admin/users/:id — update displayName, role, isActive, or password.
 */
adminUserRoutes.patch(
  '/admin/users/:id',
  ...adminOnly,
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  patchUser,
);

/**
 * DELETE /api/v1/admin/users/:id — soft-delete (is_active = false).
 */
adminUserRoutes.delete(
  '/admin/users/:id',
  ...adminOnly,
  validate({ params: userIdParamSchema }),
  deleteUser,
);
