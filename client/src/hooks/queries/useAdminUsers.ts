import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../../lib/api";
import { restoreQuerySnapshots, snapshotQueryData } from "../../lib/queryCache";
import { queryKeys } from "../../lib/queryKeys";
import type { CreateUserInput, UpdateUserInput, UserAdmin } from "../../types";

export const useAdminUsers = () =>
  useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: () => request<UserAdmin[]>("/api/v1/admin/users"),
    placeholderData: keepPreviousData,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      request<UserAdmin>("/api/v1/admin/users", {
        method: "POST",
        body: input,
      }),
    onSuccess: (created) => {
      queryClient.setQueryData<UserAdmin[]>(queryKeys.admin.users, (old = []) => [
        ...old,
        created,
      ]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users,
        refetchType: "active",
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateUserInput & { id: string }) =>
      request<UserAdmin>(`/api/v1/admin/users/${id}`, {
        method: "PATCH",
        body,
      }),
    onMutate: async ({ id, ...body }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.users });
      const snapshots = snapshotQueryData<UserAdmin[]>(
        queryClient,
        queryKeys.admin.users,
      );
      queryClient.setQueryData<UserAdmin[]>(queryKeys.admin.users, (old = []) =>
        old.map((user) => (user.id === id ? { ...user, ...body } : user)),
      );
      return { snapshots };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<UserAdmin[]>(queryKeys.admin.users, (old = []) =>
        old.map((user) => (user.id === updated.id ? updated : user)),
      );
    },
    onError: (_err, _input, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users,
        refetchType: "active",
      });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request<UserAdmin>(`/api/v1/admin/users/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.users });
      const snapshots = snapshotQueryData<UserAdmin[]>(
        queryClient,
        queryKeys.admin.users,
      );
      queryClient.setQueryData<UserAdmin[]>(queryKeys.admin.users, (old = []) =>
        old.map((user) =>
          user.id === id ? { ...user, isActive: false } : user,
        ),
      );
      return { snapshots };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<UserAdmin[]>(queryKeys.admin.users, (old = []) =>
        old.map((user) => (user.id === updated.id ? updated : user)),
      );
    },
    onError: (_err, _id, context) => {
      restoreQuerySnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users,
        refetchType: "active",
      });
    },
  });
};
