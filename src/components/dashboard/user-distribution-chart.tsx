"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface UserDistributionChartProps {
  managers: number;
  technicians: number;
  admins: number;
}

const COLORS = ["#2ADE6B", "#F59E0B", "#F53642"];

export function UserDistributionChart({
  managers,
  technicians,
  admins,
}: UserDistributionChartProps) {
  const data = [
    { name: "Managers", value: managers },
    { name: "Technicians", value: technicians },
    { name: "Admins", value: admins },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          dataKey="value"
          paddingAngle={3}
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
