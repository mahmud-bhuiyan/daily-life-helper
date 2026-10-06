import type { ReportPeriod } from "../../../types";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

type PeriodToggleProps = {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
};

export const PeriodToggle = ({ value, onChange }: PeriodToggleProps) => (
  <div
    className="inline-flex max-w-full flex-wrap gap-1 rounded-(--radius-input) border border-(--border) bg-(--surface) p-1"
    role="group"
    aria-label="Report period"
  >
    {PERIODS.map((p) => {
      const active = p.value === value;
      return (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={`min-h-11 rounded-md px-4 text-sm font-medium transition-colors ${
            active
              ? "bg-(--accent) text-(--bg)"
              : "text-(--muted) hover:bg-(--surface-hover) hover:text-(--text)"
          }`}
          aria-pressed={active}
        >
          {p.label}
        </button>
      );
    })}
  </div>
);
