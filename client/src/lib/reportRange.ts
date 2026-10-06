import type { ReportPeriod } from "../types";

/** Default chart window aligned with server report.service defaults. */
export const defaultReportRange = (period: ReportPeriod): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();

  switch (period) {
    case "day":
      from.setDate(from.getDate() - 29);
      break;
    case "week":
      from.setDate(from.getDate() - 7 * 11);
      break;
    case "month":
      from.setMonth(from.getMonth() - 11);
      break;
    case "year":
      from.setFullYear(from.getFullYear() - 4);
      break;
  }

  return { from: from.toISOString(), to: to.toISOString() };
};
