import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";
import type { Category, CreateCategoryInput } from "../../types";

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => request<Category[]>("/api/v1/categories"),
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      request<Category>("/api/v1/categories", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};
