export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type CreateCategoryInput = {
  name: string;
  color?: string;
};

export type Item = {
  id: string;
  name: string;
  unit: string | null;
  createdAt: string;
};

export type CreateItemInput = {
  name: string;
  unit?: string;
};

export type Expense = {
  id: string;
  amountMinor: number;
  currency: string;
  categoryId: string | null;
  itemId: string | null;
  quantity: number | null;
  unitPrice: number | null;
  note: string | null;
  spentAt: string;
  createdAt: string;
  categoryName: string | null;
  categoryColor: string | null;
  itemName: string | null;
};

export type CreateExpenseInput = {
  amountMinor: number;
  currency?: string;
  categoryId?: string;
  itemId?: string;
  quantity?: number;
  unitPrice?: number;
  note?: string;
  spentAt?: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput> & {
  categoryId?: string | null;
  itemId?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  note?: string | null;
};

export type ExpenseListFilters = {
  from?: string;
  to?: string;
  categoryId?: string;
  itemId?: string;
  page?: number;
  limit?: number;
};
