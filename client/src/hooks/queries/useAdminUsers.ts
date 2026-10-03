import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';
import type { CreateUserInput, UpdateUserInput, UserAdmin } from '../../types';

export const useAdminUsers = () =>
  useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: () => request<UserAdmin[]>('/api/v1/admin/users'),
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      request<UserAdmin>('/api/v1/admin/users', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateUserInput & { id: string }) =>
      request<UserAdmin>(`/api/v1/admin/users/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request<UserAdmin>(`/api/v1/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
};
