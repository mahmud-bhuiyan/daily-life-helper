import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { request, requestPaginated } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseListFilters,
  UpdateExpenseInput,
} from "../../types";

const filtersToRecord = (filters: ExpenseListFilters): Record<string, string> => {
  const record: Record<string, string> = {};
  if (filters.from) record.from = filters.from;
  if (filters.to) record.to = filters.to;
  if (filters.categoryId) record.categoryId = filters.categoryId;
  if (filters.itemId) record.itemId = filters.itemId;
  if (filters.page) record.page = String(filters.page);
  if (filters.limit) record.limit = String(filters.limit);
  return record;
};

const expensesPath = (filters: ExpenseListFilters) => {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.itemId) params.set("itemId", filters.itemId);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return `/api/v1/expenses?${params.toString()}`;
};

export const useExpenses = (filters: ExpenseListFilters) =>
  useQuery({
    queryKey: queryKeys.expenses.list(filtersToRecord(filters)),
    queryFn: () => requestPaginated<Expense[]>(expensesPath(filters)),
    placeholderData: keepPreviousData,
  });

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      request<Expense>("/api/v1/expenses", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateExpenseInput & { id: string }) =>
      request<Expense>(`/api/v1/expenses/${id}`, { method: "PATCH", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request<void>(`/api/v1/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};
