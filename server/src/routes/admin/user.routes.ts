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

adminUserRoutes.use(requireAuth, requireSuperAdmin);

/**
 * GET /api/v1/admin/users — list all users (super_admin only).
 */
adminUserRoutes.get('/admin/users', listUsers);

/**
 * POST /api/v1/admin/users — create user + seed default categories.
 */
adminUserRoutes.post('/admin/users', validate({ body: createUserSchema }), postUser);

/**
 * PATCH /api/v1/admin/users/:id — update displayName, role, isActive, or password.
 */
adminUserRoutes.patch(
  '/admin/users/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  patchUser,
);

/**
 * DELETE /api/v1/admin/users/:id — soft-delete (is_active = false).
 */
adminUserRoutes.delete(
  '/admin/users/:id',
  validate({ params: userIdParamSchema }),
  deleteUser,
);
