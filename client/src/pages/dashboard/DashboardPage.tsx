import { PageHeader } from '../../components/layout';
import { Card } from "../../components/ui";
import { useHealth } from '../../hooks';

type StatCardProps = {
  label: string;
  value: string;
  variant?: "default" | "highlight";
  loading?: boolean;
};

const StatCard = ({
  label,
  value,
  variant = "default",
  loading,
}: StatCardProps) => (
  <Card variant={variant === "highlight" ? "highlight" : "default"}>
    <p className="text-xs font-medium uppercase tracking-wider text-(--muted)">
      {label}
    </p>
    {loading ? (
      <div className="mt-3 h-8 w-24 animate-pulse rounded-(--radius-input) bg-(--surface-hover)" />
    ) : (
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${
          variant === "highlight" ? "text-(--accent)" : "text-(--text)"
        }`}
      >
        {value}
      </p>
    )}
  </Card>
);

export const DashboardPage = () => {
  const { data, isPending, isError } = useHealth();
  const loading = isPending && !data;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your spending overview and charts will appear here in Step 04."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="API status"
          value={isError ? "Unreachable" : (data?.status ?? "—")}
          loading={loading}
        />
        <StatCard
          label="Database"
          value={data?.database ?? "—"}
          loading={loading}
        />
        <StatCard
          label="Next up"
          value="Expenses"
          variant="highlight"
          loading={false}
        />
      </div>

      <Card
        className="mt-6"
        header={
          <span className="text-sm font-medium text-(--text)">
            Getting started
          </span>
        }
      >
        <ul className="space-y-3 text-sm text-(--muted)">
          <li className="flex gap-3">
            <span className="mt-0.5 text-(--accent)">✓</span>
            <span>Auth and user management are ready</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-(--muted)">○</span>
            <span>Add expenses with categories and items (Step 03)</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-(--muted)">○</span>
            <span>
              View spending charts by day, week, month, or year (Step 04)
            </span>
          </li>
        </ul>
      </Card>
    </>
  );
};
