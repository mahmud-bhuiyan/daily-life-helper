import { Router } from 'express';
import {
  deleteExpense,
  listExpenses,
  patchExpense,
  postExpense,
} from '../controllers/expense.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createExpenseSchema,
  expenseIdParamSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from '../validators/expense.validator.js';

export const expenseRoutes = Router();

expenseRoutes.use(requireAuth);

/**
 * GET /api/v1/expenses — paginated list with optional filters.
 */
expenseRoutes.get('/expenses', validate({ query: listExpensesQuerySchema }), listExpenses);

/**
 * POST /api/v1/expenses — create expense.
 */
expenseRoutes.post('/expenses', validate({ body: createExpenseSchema }), postExpense);

/**
 * PATCH /api/v1/expenses/:id — update own expense.
 */
expenseRoutes.patch(
  '/expenses/:id',
  validate({ params: expenseIdParamSchema, body: updateExpenseSchema }),
  patchExpense,
);

/**
 * DELETE /api/v1/expenses/:id — hard delete own expense.
 */
expenseRoutes.delete(
  '/expenses/:id',
  validate({ params: expenseIdParamSchema }),
  deleteExpense,
);
