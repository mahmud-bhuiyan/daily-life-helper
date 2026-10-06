import { createItemForUser, listItemsForUser, type Item } from '../models/item.model.js';
import { ApiError } from '../utils/ApiError.js';
import type { CreateItemInput, ListItemsQuery } from '../validators/item.validator.js';

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
