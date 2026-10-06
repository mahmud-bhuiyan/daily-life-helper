import { useMemo, useState } from "react";
import { ChartShell, TimeSeriesChart } from "../../components/charts";
import { PageHeader } from "../../components/layout";
import { useReportSummary } from "../../hooks";
import { defaultReportRange } from "../../lib/reportRange";
import type { ReportPeriod } from "../../types";
import { PeriodToggle } from "./components/PeriodToggle";
import { SummaryCards } from "./components/SummaryCards";

const periodSubtitle: Record<ReportPeriod, string> = {
  day: "Daily totals for the last 30 days",
  week: "Weekly totals for the last 12 weeks",
  month: "Monthly totals for the last 12 months",
  year: "Yearly totals for the last 5 years",
};

export const DashboardPage = () => {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const range = useMemo(() => defaultReportRange(period), [period]);

  const { data, isPending, isError, error, refetch } = useReportSummary({
    period,
    ...range,
  });

  const loading = isPending && !data;
  const buckets = data?.buckets ?? [];
  const bucketCount = buckets.length;
  const averageMinor =
    bucketCount > 0 ? Math.round((data?.totalMinor ?? 0) / bucketCount) : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Spending over time — switch period to regroup the chart."
        action={<PeriodToggle value={period} onChange={setPeriod} />}
      />

      {isError && !data ? (
        <div className="rounded-(--radius-card) border border-(--danger)/40 bg-(--danger)/10 px-4 py-3 text-sm text-(--text)">
          {error instanceof Error ? error.message : "Failed to load report"}
          <button
            type="button"
            className="ml-3 text-(--accent) underline"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <SummaryCards
            totalMinor={data?.totalMinor ?? 0}
            currency={data?.currency ?? "BDT"}
            expenseCount={data?.expenseCount ?? 0}
            averageMinor={averageMinor}
            loading={loading}
          />

          <div className="mt-6">
            <ChartShell
              title="Spending over time"
              subtitle={periodSubtitle[period]}
              loading={loading}
              empty={
                !loading &&
                buckets.every((bucket) => bucket.totalMinor === 0)
              }
            >
              {data && (
                <TimeSeriesChart buckets={data.buckets} currency={data.currency} />
              )}
            </ChartShell>
          </div>
        </>
      )}
    </>
  );
};
