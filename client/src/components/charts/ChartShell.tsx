import type { ReactNode } from "react";
import { Card, EmptyState } from "../ui";

type ChartShellProps = {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

export const ChartShell = ({
  title,
  subtitle,
  loading,
  empty,
  emptyMessage = "No spending in this period yet. Add expenses to see trends here.",
  children,
}: ChartShellProps) => (
  <Card
    header={
      <div>
        <h2 className="text-sm font-medium text-(--text)">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs text-(--muted)">{subtitle}</p>
        )}
      </div>
    }
  >
    {loading ? (
      <div
        className="h-56 w-full animate-pulse rounded-(--radius-input) bg-(--surface-hover) sm:h-72"
        aria-hidden
      />
    ) : empty ? (
      <EmptyState title="No data yet" description={emptyMessage} />
    ) : (
      <div className="min-h-56 w-full min-w-0 sm:min-h-72">{children}</div>
    )}
  </Card>
);
