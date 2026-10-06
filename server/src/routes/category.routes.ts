import { Router } from 'express';
import { listCategories, postCategory } from '../controllers/category.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCategorySchema } from '../validators/category.validator.js';

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
