import { QueryClient } from "@tanstack/react-query";

/**
 * Global TanStack Query defaults.
 * staleTime 60s avoids refetch storms; individual hooks can override (e.g. health uses retry: false).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});
