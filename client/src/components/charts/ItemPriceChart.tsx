import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatSpentAt, formatUnitPrice } from "../../lib/format";
import type { PriceHistoryPoint } from "../../types";

type ChartPoint = {
  label: string;
  unitPrice: number;
};

type ItemPriceChartProps = {
  points: PriceHistoryPoint[];
  currency?: string;
};

export const ItemPriceChart = ({
  points,
  currency = "BDT",
}: ItemPriceChartProps) => {
  const data: ChartPoint[] = points.map((p) => ({
    label: formatSpentAt(p.spentAt),
    unitPrice: p.unitPrice,
  }));

  return (
    <ResponsiveContainer width="100%" height={288}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
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
          minTickGap={32}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => formatUnitPrice(Number(v), currency).replace(/\.00$/, "")}
        />
        <Tooltip
          contentStyle={{
            background: "#1a2332",
            border: "1px solid #2d3a4f",
            borderRadius: 8,
            fontSize: 13,
          }}
          labelStyle={{ color: "#f1f5f9" }}
          formatter={(value) =>
            value === undefined ? "" : formatUnitPrice(Number(value), currency)
          }
        />
        <Area
          type="monotone"
          dataKey="unitPrice"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#priceGradient)"
          dot={data.length <= 24 ? { r: 3, fill: "#22c55e" } : false}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
