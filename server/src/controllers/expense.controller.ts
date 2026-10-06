import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import {
  createExpense,
  getExpenses,
  removeExpense,
  updateExpense,
} from '../services/expense.service.js';
import { sendCreated, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from '../validators/expense.validator.js';

export const listExpenses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query as unknown as ListExpensesQuery;
  const { items, total, page, limit } = await getExpenses(req.user.id, query);
  sendSuccess(res, items, 200, { total, page, limit });
});

export const postExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const expense = await createExpense(req.user.id, req.body as CreateExpenseInput);
  sendCreated(res, expense);
});

export const patchExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const expense = await updateExpense(
    req.user.id,
    req.params.id as string,
    req.body as UpdateExpenseInput,
  );
  sendSuccess(res, expense);
});

export const deleteExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await removeExpense(req.user.id, req.params.id as string);
  res.status(204).send();
});
