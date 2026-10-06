import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import { createCategory, getCategories } from '../services/category.service.js';
import { sendCreated, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { CreateCategoryInput } from '../validators/category.validator.js';

export const listCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const categories = await getCategories(req.user.id);
  sendSuccess(res, categories);
});

export const postCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const category = await createCategory(req.user.id, req.body as CreateCategoryInput);
  sendCreated(res, category);
});
