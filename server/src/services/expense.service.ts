import { findCategoryForUser } from '../models/category.model.js';
import { findItemForUser } from '../models/item.model.js';
import {
  createExpenseForUser,
  deleteExpenseForUser,
  findExpenseForUser,
  listExpensesForUser,
  updateExpenseForUser,
  type Expense,
} from '../models/expense.model.js';
import { ApiError } from '../utils/ApiError.js';
import type {
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from '../validators/expense.validator.js';

const assertCategory = async (userId: string, categoryId: string) => {
  const category = await findCategoryForUser(userId, categoryId);
  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }
};

const assertItem = async (userId: string, itemId: string) => {
  const item = await findItemForUser(userId, itemId);
  if (!item) {
    throw new ApiError(400, 'Invalid item');
  }
};

export const getExpenses = async (
  userId: string,
  query: ListExpensesQuery,
): Promise<{ items: Expense[]; total: number; page: number; limit: number }> => {
  const result = await listExpensesForUser(userId, query);
  return {
    ...result,
    page: query.page,
    limit: query.limit,
  };
};

export const createExpense = async (
  userId: string,
  input: CreateExpenseInput,
): Promise<Expense> => {
  if (input.categoryId) {
    await assertCategory(userId, input.categoryId);
  }
  if (input.itemId) {
    await assertItem(userId, input.itemId);
  }

  return createExpenseForUser(userId, input);
};

export const updateExpense = async (
  userId: string,
  expenseId: string,
  input: UpdateExpenseInput,
): Promise<Expense> => {
  if (input.categoryId) {
    await assertCategory(userId, input.categoryId);
  }
  if (input.itemId) {
    await assertItem(userId, input.itemId);
  }

  const expense = await updateExpenseForUser(userId, expenseId, input);
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  return expense;
};

export const removeExpense = async (userId: string, expenseId: string): Promise<void> => {
  const existing = await findExpenseForUser(userId, expenseId);
  if (!existing) {
    throw new ApiError(404, 'Expense not found');
  }

  await deleteExpenseForUser(userId, expenseId);
};
