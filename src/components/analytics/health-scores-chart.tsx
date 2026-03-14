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

interface Equipment {
  name: string;
  health_score: number;
}

export function HealthScoresChart({ equipment }: { equipment: Equipment[] }) {
  const getColor = (score: number) => {
    if (score >= 80) return "#2ADE6B";
    if (score >= 50) return "#F59E0B";
    return "#F53642";
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={equipment}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#5A6578" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#5A6578" }} />
        <Tooltip />
        <Bar dataKey="health_score" radius={[4, 4, 0, 0]}>
          {equipment.map((eq, index) => (
            <Cell key={index} fill={getColor(eq.health_score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
