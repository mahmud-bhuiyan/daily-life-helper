import { z } from 'zod';

export const listItemsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export const createItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  unit: z.string().trim().max(20).optional(),
});

export const itemIdParamSchema = z.object({
  id: z.uuid(),
});

export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
