import {
  createItemForUser,
  findItemForUser,
  getItemPriceHistoryForUser,
  listItemsForUser,
  type Item,
  type ItemPriceHistory,
} from '../models/item.model.js';
import { ApiError } from '../utils/ApiError.js';
import type {
  CreateItemInput,
  ListItemsQuery,
  PriceHistoryQuery,
} from '../validators/item.validator.js';

export const getItems = async (userId: string, query: ListItemsQuery): Promise<Item[]> =>
  listItemsForUser(userId, query.search);

export const createItem = async (userId: string, input: CreateItemInput): Promise<Item> => {
  try {
    return await createItemForUser(userId, input);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new ApiError(409, 'Item name already exists');
    }
    throw err;
  }
};

export const getItemPriceHistory = async (
  userId: string,
  itemId: string,
  query: PriceHistoryQuery,
): Promise<ItemPriceHistory> => {
  const item = await findItemForUser(userId, itemId);
  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  if (new Date(query.from) > new Date(query.to)) {
    throw new ApiError(400, '`from` must be before `to`');
  }

  return getItemPriceHistoryForUser(userId, itemId, query.from, query.to);
};
