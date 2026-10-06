import type { QueryClient, QueryKey } from "@tanstack/react-query";

/** Prefix for optimistic list rows replaced on mutation success. */
export const OPTIMISTIC_ID_PREFIX = "optimistic-";

export const optimisticId = () =>
  `${OPTIMISTIC_ID_PREFIX}${crypto.randomUUID()}`;

export const isOptimisticId = (id: string) =>
  id.startsWith(OPTIMISTIC_ID_PREFIX);

export type QuerySnapshot<T> = [QueryKey, T | undefined][];

export const snapshotQueryData = <T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): QuerySnapshot<T> =>
  queryClient.getQueriesData<T>({ queryKey });

export const restoreQuerySnapshots = <T>(
  queryClient: QueryClient,
  snapshots: QuerySnapshot<T> | undefined,
) => {
  snapshots?.forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });
};
