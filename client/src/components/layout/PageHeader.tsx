import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-(--text) sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-(--muted) sm:text-base">
          {description}
        </p>
      )}
    </div>
    {action && (
      <div className="shrink-0 [&>button]:w-full sm:[&>button]:w-auto">
        {action}
      </div>
    )}
  </div>
);
