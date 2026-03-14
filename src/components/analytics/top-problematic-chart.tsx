"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TopEquipment {
  name: string;
  alertCount: number;
}

export function TopProblematicChart({ data }: { data: TopEquipment[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 12, fill: "#5A6578" }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#5A6578" }}
          width={140}
        />
        <Tooltip />
        <Bar dataKey="alertCount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
