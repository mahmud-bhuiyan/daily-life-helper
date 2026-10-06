import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../../lib/api";
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
  });

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItemInput) =>
      request<Item>("/api/v1/items", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
    },
  });
};
