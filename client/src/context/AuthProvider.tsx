import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useMemo, type ReactNode } from 'react';
import { request, ApiError } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { LoginInput, UserProfile } from '../types';

type AuthContextValue = {
  user: UserProfile | null | undefined;
  isPending: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const fetchMe = async (): Promise<UserProfile | null> => {
  try {
    return await request<UserProfile>('/api/v1/auth/me');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) =>
      request<UserProfile>('/api/v1/auth/login', { method: 'POST', body: input }),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.auth.me, profile);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => request<void>('/api/v1/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.removeQueries();
    },
  });

  const login = useCallback(
    async (input: LoginInput) => {
      await loginMutation.mutateAsync(input);
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data,
      isPending: meQuery.isPending,
      isAuthenticated: !!meQuery.data,
      isSuperAdmin: meQuery.data?.role === 'super_admin',
      login,
      logout,
    }),
    [meQuery.data, meQuery.isPending, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
