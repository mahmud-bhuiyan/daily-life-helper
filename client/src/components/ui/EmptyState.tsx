import type { ReactNode } from 'react';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-(--radius-card) border border-dashed border-(--border) bg-(--surface)/50 px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent)/10 text-2xl text-(--accent)">
      {icon ?? '○'}
    </div>
    <h3 className="text-lg font-semibold text-(--text)">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-(--muted)">{description}</p>}
    {actionLabel && onAction && (
      <Button className="mt-6 w-full sm:w-auto" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
