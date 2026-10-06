import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../../lib/api";
import {
  isOptimisticId,
  optimisticId,
  restoreQuerySnapshots,
  snapshotQueryData,
} from "../../lib/queryCache";
import { queryKeys } from "../../lib/queryKeys";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../types";

const defaultColor = "#6366f1";

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => request<Category[]>("/api/v1/categories"),
    placeholderData: keepPreviousData,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      request<Category>("/api/v1/categories", { method: "POST", body: input }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });
      const snapshots = snapshotQueryData<Category[]>(
        queryClient,
        queryKeys.categories.all,
      );
      const optimistic: Category = {
        id: optimisticId(),
        name: input.name.trim(),
        color: input.color ?? defaultColor,
        scope: input.scope ?? "user",
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Category[]>(queryKeys.categories.all, (old = []) => [
        ...old,
        optimistic,
      ]);
      return { snapshots, optimisticId: optimistic.id };
    },
    onSuccess: (created, _input, context) => {
      queryClient.setQueryData<Category[]>(queryKeys.categories.all, (old = []) => {
        const without = old.filter(
          (c) => c.id !== context?.optimisticId && !isOptimisticId(c.id),
        );
        return [...without, created];
      });
    },
    onError: (_err, _input, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
        refetchType: "active",
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateCategoryInput & { id: string }) =>
      request<Category>(`/api/v1/categories/${id}`, {
        method: "PATCH",
        body: input,
      }),
    onMutate: async ({ id, ...input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });
      const snapshots = snapshotQueryData<Category[]>(
        queryClient,
        queryKeys.categories.all,
      );
      queryClient.setQueryData<Category[]>(queryKeys.categories.all, (old = []) =>
        old.map((category) =>
          category.id === id
            ? {
                ...category,
                ...(input.name !== undefined ? { name: input.name.trim() } : {}),
                ...(input.color !== undefined ? { color: input.color } : {}),
              }
            : category,
        ),
      );
      return { snapshots };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Category[]>(queryKeys.categories.all, (old = []) =>
        old.map((category) => (category.id === updated.id ? updated : category)),
      );
    },
    onError: (_err, _input, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
        refetchType: "active",
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request<void>(`/api/v1/categories/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });
      const snapshots = snapshotQueryData<Category[]>(
        queryClient,
        queryKeys.categories.all,
      );
      queryClient.setQueryData<Category[]>(queryKeys.categories.all, (old = []) =>
        old.filter((category) => category.id !== id),
      );
      return { snapshots };
    },
    onError: (_err, _id, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};
