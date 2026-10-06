import { Router } from 'express';
import { listItems, postItem } from '../controllers/item.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createItemSchema, listItemsQuerySchema } from '../validators/item.validator.js';

export const itemRoutes = Router();

itemRoutes.use(requireAuth);

/**
 * GET /api/v1/items — list items (`?search=` optional).
 */
itemRoutes.get('/items', validate({ query: listItemsQuerySchema }), listItems);

/**
 * POST /api/v1/items — create `{ name, unit? }`.
 */
itemRoutes.post('/items', validate({ body: createItemSchema }), postItem);
