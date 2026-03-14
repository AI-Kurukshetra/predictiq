"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

interface HealthDistributionChartProps {
  healthy: number;
  warning: number;
  critical: number;
}

export function HealthDistributionChart({
  healthy,
  warning,
  critical,
}: HealthDistributionChartProps) {
  const data = [
    { name: "Healthy", count: healthy, color: "#2ADE6B" },
    { name: "Warning", count: warning, color: "#F59E0B" },
    { name: "Critical", count: critical, color: "#F53642" },
  ];

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} layout="horizontal">
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5A6578" }} />
        <YAxis tick={{ fontSize: 12, fill: "#5A6578" }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
