import {
  countExpensesWithCategory,
  createCategoryForUser,
  createGlobalCategory,
  deleteCategoryById,
  findCategoryRowById,
  findGlobalCategoryByName,
  listCategoriesForUser,
  updateCategoryRow,
  type Category,
} from '../models/category.model.js';
import type { UserRole } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validators/category.validator.js';

const assertCanManageCategory = (
  row: { user_id: string | null },
  userId: string,
  role: UserRole,
) => {
  if (row.user_id === null) {
    if (role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can change global categories');
    }
    return;
  }

  if (row.user_id !== userId) {
    throw new ApiError(404, 'Category not found');
  }
};

const assertNoExpenses = async (categoryId: string) => {
  const count = await countExpensesWithCategory(categoryId);
  if (count > 0) {
    throw new ApiError(
      409,
      'Cannot delete this category — one or more expenses still use it',
    );
  }
};

export const getCategories = async (userId: string): Promise<Category[]> =>
  listCategoriesForUser(userId);

export const createCategory = async (
  userId: string,
  role: UserRole,
  input: CreateCategoryInput,
): Promise<Category> => {
  const name = input.name.trim();
  if (!name) {
    throw new ApiError(400, 'Category name is required');
  }

  const wantsGlobal = input.scope === 'global';

  if (wantsGlobal) {
    if (role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can create global categories');
    }

    const existingGlobal = await findGlobalCategoryByName(name);
    if (existingGlobal) {
      throw new ApiError(409, 'A global category with this name already exists');
    }

    try {
      return await createGlobalCategory({ ...input, name });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
        throw new ApiError(409, 'A global category with this name already exists');
      }
      throw err;
    }
  }

  const global = await findGlobalCategoryByName(name);
  if (global) {
    throw new ApiError(
      409,
      'That name is already a global category — pick it from the list or use a different name',
    );
  }

  try {
    return await createCategoryForUser(userId, { ...input, name });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new ApiError(409, 'You already have a category with this name');
    }
    throw err;
  }
};

export const updateCategory = async (
  userId: string,
  role: UserRole,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<Category> => {
  const row = await findCategoryRowById(categoryId);
  if (!row) {
    throw new ApiError(404, 'Category not found');
  }

  assertCanManageCategory(row, userId, role);

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new ApiError(400, 'Category name is required');
    }

    const global = await findGlobalCategoryByName(name);
    if (global && global.id !== categoryId) {
      throw new ApiError(409, 'That name is already used by a global category');
    }
  }

  try {
    const updated = await updateCategoryRow(categoryId, input);
    if (!updated) {
      throw new ApiError(404, 'Category not found');
    }
    return updated;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new ApiError(409, 'You already have a category with this name');
    }
    throw err;
  }
};

export const removeCategory = async (
  userId: string,
  role: UserRole,
  categoryId: string,
): Promise<void> => {
  const row = await findCategoryRowById(categoryId);
  if (!row) {
    throw new ApiError(404, 'Category not found');
  }

  assertCanManageCategory(row, userId, role);
  await assertNoExpenses(categoryId);

  const deleted = await deleteCategoryById(categoryId);
  if (!deleted) {
    throw new ApiError(404, 'Category not found');
  }
};
