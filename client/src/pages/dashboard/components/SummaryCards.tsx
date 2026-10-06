import { Card } from "../../../components/ui";
import { formatMoney } from "../../../lib/format";

type SummaryCardsProps = {
  totalMinor: number;
  currency: string;
  expenseCount: number;
  averageMinor: number;
  loading?: boolean;
};

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

export const SummaryCards = ({
  totalMinor,
  currency,
  expenseCount,
  averageMinor,
  loading,
}: SummaryCardsProps) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <StatCard
      label="Total spent"
      value={formatMoney(totalMinor, currency)}
      variant="highlight"
      loading={loading}
    />
    <StatCard
      label="Transactions"
      value={String(expenseCount)}
      loading={loading}
    />
    <StatCard
      label="Avg per bucket"
      value={formatMoney(averageMinor, currency)}
      loading={loading}
    />
  </div>
);
