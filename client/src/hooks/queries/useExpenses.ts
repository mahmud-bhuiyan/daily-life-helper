import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { request, requestPaginated, type PaginatedResponse } from "../../lib/api";
import { restoreQuerySnapshots, snapshotQueryData } from "../../lib/queryCache";
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

const patchExpenseLists = (
  queryClient: ReturnType<typeof useQueryClient>,
  patch: (expenses: Expense[]) => Expense[],
) => {
  queryClient.setQueriesData<PaginatedResponse<Expense[]>>(
    { queryKey: ["expenses"] },
    (old) => {
      if (!old) return old;
      const next = patch(old.data);
      const removed = old.data.length - next.length;
      return {
        data: next,
        meta: removed
          ? { ...old.meta, total: Math.max(0, old.meta.total - removed) }
          : old.meta,
      };
    },
  );
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
    onSuccess: (created) => {
      queryClient.setQueriesData<PaginatedResponse<Expense[]>>(
        { queryKey: ["expenses"] },
        (old) => {
          if (!old || old.data.some((e) => e.id === created.id)) return old;
          return {
            data: [created, ...old.data].slice(0, old.meta.limit),
            meta: { ...old.meta, total: old.meta.total + 1 },
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["reports"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all, refetchType: "active" });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateExpenseInput & { id: string }) =>
      request<Expense>(`/api/v1/expenses/${id}`, { method: "PATCH", body }),
    onMutate: async ({ id, ...body }) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const snapshots = snapshotQueryData<PaginatedResponse<Expense[]>>(
        queryClient,
        ["expenses"],
      );
      patchExpenseLists(queryClient, (expenses) =>
        expenses.map((expense) =>
          expense.id === id ? { ...expense, ...body } : expense,
        ),
      );
      return { snapshots };
    },
    onSuccess: (updated) => {
      patchExpenseLists(queryClient, (expenses) =>
        expenses.map((expense) => (expense.id === updated.id ? updated : expense)),
      );
    },
    onError: (_err, _input, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["reports"], refetchType: "active" });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request<void>(`/api/v1/expenses/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const snapshots = snapshotQueryData<PaginatedResponse<Expense[]>>(
        queryClient,
        ["expenses"],
      );
      patchExpenseLists(queryClient, (expenses) =>
        expenses.filter((expense) => expense.id !== id),
      );
      return { snapshots };
    },
    onError: (_err, _id, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["reports"], refetchType: "active" });
    },
  });
};
