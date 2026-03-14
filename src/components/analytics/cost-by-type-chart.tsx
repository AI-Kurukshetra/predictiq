"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CostByType {
  type: string;
  cost: number;
}

export function CostByTypeChart({ data }: { data: CostByType[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 12, fill: "#5A6578" }} tickFormatter={(v) => `$${v}`} />
        <YAxis
          type="category"
          dataKey="type"
          tick={{ fontSize: 11, fill: "#5A6578" }}
          width={120}
        />
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        <Bar dataKey="cost" fill="#0B2340" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
