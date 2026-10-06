import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { request } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";
import type { CategoryReportRow, SummaryReport, SummaryReportParams } from "../../types";

const summaryPath = ({ period, from, to }: SummaryReportParams) => {
  const params = new URLSearchParams({ period });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return `/api/v1/reports/summary?${params.toString()}`;
};

const paramsToRecord = (params: SummaryReportParams) => ({
  period: params.period,
  ...(params.from ? { from: params.from } : {}),
  ...(params.to ? { to: params.to } : {}),
});

export const useReportSummary = (params: SummaryReportParams) =>
  useQuery({
    queryKey: queryKeys.reports.summary(paramsToRecord(params)),
    queryFn: () => request<SummaryReport>(summaryPath(params)),
    placeholderData: keepPreviousData,
  });

export const useReportByCategory = (from: string, to: string) =>
  useQuery({
    queryKey: queryKeys.reports.byCategory({ from, to }),
    queryFn: () => {
      const params = new URLSearchParams({ from, to });
      return request<CategoryReportRow[]>(
        `/api/v1/reports/by-category?${params.toString()}`,
      );
    },
    placeholderData: keepPreviousData,
  });
