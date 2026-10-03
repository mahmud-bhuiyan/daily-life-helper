export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  health: ['health'] as const,
  categories: {
    all: ['categories'] as const,
  },
  items: {
    all: ['items'] as const,
    priceHistory: (id: string, from?: string, to?: string) =>
      ['items', id, 'price-history', from, to] as const,
  },
  expenses: {
    list: (filters?: Record<string, string>) => ['expenses', filters] as const,
  },
  reports: {
    summary: (params?: Record<string, string>) => ['reports', 'summary', params] as const,
    byCategory: (params?: Record<string, string>) => ['reports', 'by-category', params] as const,
    topItems: (params?: Record<string, string>) => ['reports', 'top-items', params] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
  },
};
