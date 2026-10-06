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

export const priceHistoryQuerySchema = z.object({
  from: z.iso.datetime(),
  to: z.iso.datetime(),
});

export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type PriceHistoryQuery = z.infer<typeof priceHistoryQuerySchema>;
