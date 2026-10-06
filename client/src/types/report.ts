export type ReportPeriod = "day" | "week" | "month" | "year";

export type ReportBucket = {
  periodStart: string;
  label: string;
  totalMinor: number;
};

export type SummaryReport = {
  totalMinor: number;
  currency: string;
  expenseCount: number;
  buckets: ReportBucket[];
  from: string;
  to: string;
  period: ReportPeriod;
};

export type CategoryReportRow = {
  categoryId: string | null;
  categoryName: string;
  color: string;
  totalMinor: number;
};

export type SummaryReportParams = {
  period: ReportPeriod;
  from?: string;
  to?: string;
};
