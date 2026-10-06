import { Router } from 'express';
import {
  deleteCategory,
  listCategories,
  patchCategory,
  postCategory,
} from '../controllers/category.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator.js';

export const categoryRoutes = Router();

categoryRoutes.use(requireAuth);

/**
 * GET /api/v1/categories — list current user's categories.
 */
categoryRoutes.get('/categories', listCategories);

/**
 * POST /api/v1/categories — create `{ name, color? }`.
 */
categoryRoutes.post('/categories', validate({ body: createCategorySchema }), postCategory);

/**
 * PATCH /api/v1/categories/:id — update name/color (own category, or global if super_admin).
 */
categoryRoutes.patch(
  '/categories/:id',
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  patchCategory,
);

/**
 * DELETE /api/v1/categories/:id — only when no expenses reference it.
 */
categoryRoutes.delete(
  '/categories/:id',
  validate({ params: categoryIdParamSchema }),
  deleteCategory,
);
