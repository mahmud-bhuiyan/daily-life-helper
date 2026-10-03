import { useQuery } from '@tanstack/react-query';
import { request } from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';

type HealthResponse = {
  status: string;
  database: string;
  timestamp: string;
};

export const useHealth = () =>
  useQuery({
    queryKey: queryKeys.health,
    queryFn: () => request<HealthResponse>('/api/v1/health'),
    retry: false,
  });
