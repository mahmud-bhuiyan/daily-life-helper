import { z } from 'zod';

const optionalUuid = z.uuid().optional();
const nullableUuid = z.uuid().nullable().optional();

export const listExpensesQuerySchema = z.object({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  categoryId: optionalUuid,
  itemId: optionalUuid,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const expenseBodyFields = {
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3).optional(),
  categoryId: optionalUuid,
  itemId: optionalUuid,
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  note: z.string().trim().max(500).optional(),
  spentAt: z.iso.datetime().optional(),
};

export const createExpenseSchema = z.object(expenseBodyFields);

export const updateExpenseSchema = z
  .object({
    amountMinor: z.number().int().positive().optional(),
    currency: z.string().length(3).optional(),
    categoryId: nullableUuid,
    itemId: nullableUuid,
    quantity: z.number().positive().nullable().optional(),
    unitPrice: z.number().positive().nullable().optional(),
    note: z.string().trim().max(500).nullable().optional(),
    spentAt: z.iso.datetime().optional(),
  })
  .refine(
    (data) =>
      data.amountMinor !== undefined ||
      data.currency !== undefined ||
      data.categoryId !== undefined ||
      data.itemId !== undefined ||
      data.quantity !== undefined ||
      data.unitPrice !== undefined ||
      data.note !== undefined ||
      data.spentAt !== undefined,
    { message: 'At least one field is required' },
  );

export const expenseIdParamSchema = z.object({
  id: z.uuid(),
});

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
