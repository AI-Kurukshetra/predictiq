"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CostEntry {
  type: string;
  cost: number;
}

const TYPE_COLORS: Record<string, string> = {
  preventive: "#2ADE6B",
  corrective: "#F59E0B",
  predictive: "#3B82F6",
  emergency: "#F53642",
};

export function MaintenanceCostChart({ data }: { data: CostEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="cost"
          nameKey="type"
          label={({ name, value }) => `${name}: $${Number(value).toLocaleString()}`}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={TYPE_COLORS[entry.type] ?? "#8C95A6"} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
