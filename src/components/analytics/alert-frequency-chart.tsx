"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

interface AlertFrequencyChartProps {
  data: { date: string; count: number }[];
}

export function AlertFrequencyChart({ data }: AlertFrequencyChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), "MMM dd"),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={formatted}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5A6578" }} />
        <YAxis tick={{ fontSize: 12, fill: "#5A6578" }} allowDecimals={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
