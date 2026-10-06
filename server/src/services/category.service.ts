import {
  createCategoryForUser,
  listCategoriesForUser,
  type Category,
} from '../models/category.model.js';
import { ApiError } from '../utils/ApiError.js';
import type { CreateCategoryInput } from '../validators/category.validator.js';

export const getCategories = async (userId: string): Promise<Category[]> =>
  listCategoriesForUser(userId);

export const createCategory = async (
  userId: string,
  input: CreateCategoryInput,
): Promise<Category> => {
  try {
    return await createCategoryForUser(userId, input);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new ApiError(409, 'Category name already exists');
    }
    throw err;
  }
};
