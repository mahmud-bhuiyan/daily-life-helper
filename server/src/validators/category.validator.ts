import { z } from 'zod';
import { CATEGORY_NAME_MAX_LENGTH } from '../constants/category.js';

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const categoryNameSchema = z
  .string()
  .trim()
  .min(1, 'Category name is required')
  .max(
    CATEGORY_NAME_MAX_LENGTH,
    `Category name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`,
  );

export const createCategorySchema = z.object({
  name: categoryNameSchema,
  color: colorSchema.optional(),
  /** `global` creates a shared category; only super_admin may set this. */
  scope: z.enum(['global', 'user']).optional(),
});

export const updateCategorySchema = z
  .object({
    name: categoryNameSchema.optional(),
    color: colorSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.color !== undefined, {
    message: 'Provide name or color to update',
  });

export const categoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
