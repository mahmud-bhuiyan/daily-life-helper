import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import {
  createCategory,
  getCategories,
  removeCategory,
  updateCategory,
} from '../services/category.service.js';
import { sendCreated, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validators/category.validator.js';

export const listCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const categories = await getCategories(req.user.id);
  sendSuccess(res, categories);
});

export const postCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const category = await createCategory(
    req.user.id,
    req.user.role,
    req.body as CreateCategoryInput,
  );
  sendCreated(res, category);
});

export const patchCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const category = await updateCategory(
    req.user.id,
    req.user.role,
    req.params.id as string,
    req.body as UpdateCategoryInput,
  );
  sendSuccess(res, category);
});

export const deleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await removeCategory(req.user.id, req.user.role, req.params.id as string);
  res.status(204).send();
});
