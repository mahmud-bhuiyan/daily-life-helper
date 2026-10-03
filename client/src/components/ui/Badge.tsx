import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'muted' | 'danger';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-(--accent)/15 text-(--accent) ring-1 ring-(--accent)/20',
  muted: 'bg-(--muted)/10 text-(--muted) ring-1 ring-(--border)',
  danger: 'bg-(--danger)/10 text-(--danger) ring-1 ring-(--danger)/20',
};

export const Badge = ({ children, variant = 'muted' }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
  >
    {children}
  </span>
);
