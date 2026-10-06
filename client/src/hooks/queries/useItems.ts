import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { request } from "../../lib/api";
import {
  isOptimisticId,
  optimisticId,
  restoreQuerySnapshots,
  snapshotQueryData,
} from "../../lib/queryCache";
import { queryKeys } from "../../lib/queryKeys";
import type {
  CreateItemInput,
  Item,
  ItemPriceHistory,
  ItemPriceHistoryParams,
} from "../../types";

const itemsPath = (search?: string) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const qs = params.toString();
  return `/api/v1/items${qs ? `?${qs}` : ""}`;
};

export const useItems = (search?: string) =>
  useQuery({
    queryKey: [...queryKeys.items.all, search ?? ""] as const,
    queryFn: () => request<Item[]>(itemsPath(search)),
    placeholderData: keepPreviousData,
  });

const priceHistoryPath = (id: string, params: ItemPriceHistoryParams) => {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  return `/api/v1/items/${id}/price-history?${qs}`;
};

export const useItemPriceHistory = (
  itemId: string | undefined,
  params: ItemPriceHistoryParams | undefined,
) =>
  useQuery({
    queryKey: queryKeys.items.priceHistory(
      itemId ?? "",
      params?.from,
      params?.to,
    ),
    queryFn: () => request<ItemPriceHistory>(priceHistoryPath(itemId!, params!)),
    enabled: Boolean(itemId && params?.from && params?.to),
    placeholderData: keepPreviousData,
  });

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItemInput) =>
      request<Item>("/api/v1/items", { method: "POST", body: input }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.items.all });
      const snapshots = snapshotQueryData<Item[]>(queryClient, queryKeys.items.all);
      const optimistic: Item = {
        id: optimisticId(),
        name: input.name.trim(),
        unit: input.unit?.trim() || null,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueriesData<Item[]>({ queryKey: queryKeys.items.all }, (old = []) => [
        ...old,
        optimistic,
      ]);
      return { snapshots, optimisticId: optimistic.id };
    },
    onSuccess: (created, _input, context) => {
      queryClient.setQueriesData<Item[]>({ queryKey: queryKeys.items.all }, (old = []) => {
        const without = old.filter(
          (item) => item.id !== context?.optimisticId && !isOptimisticId(item.id),
        );
        return [...without, created];
      });
    },
    onError: (_err, _input, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.items.all,
        refetchType: "active",
      });
    },
  });
};
