import { useQuery } from "@tanstack/react-query";
import { request } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

type HealthResponse = {
  status: string;
  database: string;
  timestamp: string;
};

/** GET /api/v1/health — public, no auth. retry: false to avoid spam on outage. */
export const useHealth = () =>
  useQuery({
    queryKey: queryKeys.health,
    queryFn: () => request<HealthResponse>("/api/v1/health"),
    retry: false,
  });
