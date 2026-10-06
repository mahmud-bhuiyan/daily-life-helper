import { Router } from 'express';
import { getPriceHistory, listItems, postItem } from '../controllers/item.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createItemSchema,
  itemIdParamSchema,
  listItemsQuerySchema,
  priceHistoryQuerySchema,
} from '../validators/item.validator.js';

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

/**
 * GET /api/v1/items/:id/price-history — unit price time series (`from`, `to` ISO datetimes).
 */
itemRoutes.get(
  '/items/:id/price-history',
  validate({ params: itemIdParamSchema, query: priceHistoryQuerySchema }),
  getPriceHistory,
);
