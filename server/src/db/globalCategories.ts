/** Shared expense categories (user_id NULL in DB). Keep in sync with 002 migration seeds. */
export const GLOBAL_CATEGORIES = [
  { name: 'Food', color: '#22c55e' },
  { name: 'Transport', color: '#3b82f6' },
  { name: 'Utilities', color: '#f59e0b' },
  { name: 'Shopping', color: '#a855f7' },
  { name: 'Health', color: '#ef4444' },
  { name: 'Entertainment', color: '#ec4899' },
  { name: 'Education', color: '#8b5cf6' },
  { name: 'Rent', color: '#78716c' },
  { name: 'Insurance', color: '#0ea5e9' },
  { name: 'Personal care', color: '#14b8a6' },
  { name: 'Travel', color: '#06b6d4' },
  { name: 'Subscriptions', color: '#6366f1' },
  { name: 'Gifts', color: '#d946ef' },
  { name: 'Home', color: '#84cc16' },
  { name: 'Other', color: '#64748b' },
] as const;
