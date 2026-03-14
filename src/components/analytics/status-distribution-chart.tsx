"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface StatusDistributionChartProps {
  healthy: number;
  warning: number;
  critical: number;
}

const COLORS = ["#2ADE6B", "#F59E0B", "#F53642"];

export function StatusDistributionChart({ healthy, warning, critical }: StatusDistributionChartProps) {
  const data = [
    { name: "Healthy", value: healthy },
    { name: "Warning", value: warning },
    { name: "Critical", value: critical },
  ];

  const total = healthy + warning + critical;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          paddingAngle={3}
          label={({ name, value }) => `${name}: ${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
