import { useHealth } from '../../hooks/queries/useHealth';

export const HomePage = () => {
  const { data, isPending, isError, error, isFetching } = useHealth();

  // Show skeleton only on first load — keep cached data visible during background refetch
  const showSkeleton = isPending && !data;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div
        className="w-full max-w-lg rounded-(--radius-card) border border-(--border) bg-(--surface) p-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Daily Life Helper</h1>
        <p className="mt-2 text-(--muted)">
          Step 01 scaffold — server health check via TanStack Query.
        </p>

        <div className="mt-6 rounded-(--radius-input) border border-(--border) bg-(--bg) p-4">
          {showSkeleton && (
            <p className="text-sm text-(--muted)">Checking API…</p>
          )}
          {isError && !data && (
            <p className="text-sm text-(--danger)">
              {(error as Error).message}
            </p>
          )}
          {data && (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-(--muted)">Status</dt>
                <dd className="font-medium text-(--accent)">{data.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-(--muted)">Database</dt>
                <dd>{data.database}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-(--muted)">Checked at</dt>
                <dd className="text-right text-xs">{data.timestamp}</dd>
              </div>
              {isFetching && (
                <p className="pt-2 text-xs text-(--muted)">
                  Syncing in background… (cached data still shown)
                </p>
              )}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};
