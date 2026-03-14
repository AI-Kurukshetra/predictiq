"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
} from "recharts";

type Reading = {
  value: number;
  recorded_at: string;
  is_anomaly: boolean;
};

interface SensorChartProps {
  readings: Reading[];
  sensorType: string;
  unit: string;
  minThreshold: number | null;
  maxThreshold: number | null;
}

function AnomalyDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as {
    cx: number;
    cy: number;
    payload: Reading;
  };
  if (!payload?.is_anomaly) return null;
  return <circle cx={cx} cy={cy} r={4} fill="#F53642" stroke="none" />;
}

function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload: Reading & { time: string } }>;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#E8ECF1] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-[#1A2332]">
        {d.value} {unit}
      </p>
      <p className="text-[#5A6578]">{d.time}</p>
      {d.is_anomaly && <p className="mt-0.5 font-semibold text-[#F53642]">Anomaly</p>}
    </div>
  );
}

export function SensorChart({
  readings,
  sensorType,
  unit,
  minThreshold,
  maxThreshold,
}: SensorChartProps) {
  const data = useMemo(() => {
    return [...readings]
      .sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      )
      .map((r) => ({
        ...r,
        date: format(new Date(r.recorded_at), "MMM dd"),
        time: format(new Date(r.recorded_at), "MMM dd, HH:mm"),
      }));
  }, [readings]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`fill-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#E8ECF1" strokeDasharray="4 4" />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#5A6578" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#5A6578" }}
          tickLine={false}
          axisLine={false}
          label={{
            value: unit,
            position: "insideTopLeft",
            offset: -4,
            style: { fontSize: 11, fill: "#5A6578" },
          }}
        />

        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ stroke: "#E8ECF1" }}
        />

        {maxThreshold != null && (
          <ReferenceLine
            y={maxThreshold}
            stroke="#F53642"
            strokeDasharray="6 3"
            label={{ value: "Max", position: "right", fill: "#F53642", fontSize: 11 }}
          />
        )}
        {minThreshold != null && (
          <ReferenceLine
            y={minThreshold}
            stroke="#3B82F6"
            strokeDasharray="6 3"
            label={{ value: "Min", position: "right", fill: "#3B82F6", fontSize: 11 }}
          />
        )}

        <Area
          type="monotone"
          dataKey="value"
          fill={`url(#fill-${sensorType})`}
          stroke="none"
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={<AnomalyDot />}
          activeDot={{ r: 4, fill: "#3B82F6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SensorChart;
