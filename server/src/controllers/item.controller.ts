import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import { createItem, getItems } from '../services/item.service.js';
import { sendCreated, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { CreateItemInput, ListItemsQuery } from '../validators/item.validator.js';

export const listItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const items = await getItems(req.user.id, req.query as unknown as ListItemsQuery);
  sendSuccess(res, items);
});

export const postItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await createItem(req.user.id, req.body as CreateItemInput);
  sendCreated(res, item);
});
