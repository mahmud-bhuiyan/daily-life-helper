import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "../../lib/format";
import type { ReportBucket } from "../../types";

type ChartPoint = {
  label: string;
  totalMinor: number;
};

type TimeSeriesChartProps = {
  buckets: ReportBucket[];
  currency: string;
};

const tooltipFormatter = (value: number | undefined, currency: string) =>
  value === undefined ? "" : formatMoney(value, currency);

export const TimeSeriesChart = ({ buckets, currency }: TimeSeriesChartProps) => {
  const data: ChartPoint[] = buckets.map((b) => ({
    label: b.label,
    totalMinor: b.totalMinor,
  }));

  return (
    <ResponsiveContainer width="100%" height={288}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2d3a4f" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#2d3a4f" }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => formatMoney(Number(v), currency).replace(/\.00$/, "")}
        />
        <Tooltip
          contentStyle={{
            background: "#1a2332",
            border: "1px solid #2d3a4f",
            borderRadius: 8,
            fontSize: 13,
          }}
          labelStyle={{ color: "#f1f5f9" }}
          formatter={(value) => tooltipFormatter(Number(value), currency)}
        />
        <Area
          type="monotone"
          dataKey="totalMinor"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#spendGradient)"
          dot={data.length <= 31 ? { r: 3, fill: "#22c55e" } : false}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
