"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  preventive: number;
  corrective: number;
  predictive: number;
}

export function MonthlyCostChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5A6578" }} />
        <YAxis tick={{ fontSize: 12, fill: "#5A6578" }} tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        <Legend />
        <Bar dataKey="preventive" stackId="cost" fill="#0D8070" name="Preventive" />
        <Bar dataKey="corrective" stackId="cost" fill="#E07A5F" name="Corrective" />
        <Bar dataKey="predictive" stackId="cost" fill="#3B82F6" name="Predictive" />
      </BarChart>
    </ResponsiveContainer>
  );
}
