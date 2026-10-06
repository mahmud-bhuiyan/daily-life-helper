import { Button } from "./Button";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export const ErrorBanner = ({ message, onRetry }: ErrorBannerProps) => (
  <div
    role="alert"
    className="flex flex-col gap-3 rounded-(--radius-card) border border-(--danger)/40 bg-(--danger)/10 px-4 py-3 text-sm text-(--text) sm:flex-row sm:items-center sm:justify-between"
  >
    <p className="min-w-0">{message}</p>
    {onRetry && (
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={onRetry}
        className="shrink-0 self-start sm:self-auto"
      >
        Retry
      </Button>
    )}
  </div>
);
