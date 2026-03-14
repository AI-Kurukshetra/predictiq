"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface EquipmentData {
  id: string;
  name: string;
  health_score: number;
  status: string;
  last_maintenance: string | null;
  install_date: string | null;
  alertCount: number;
  predictionCount: number;
  sensorReadings: {
    sensor_id: string;
    type: string;
    unit: string;
    readings: { value: number; recorded_at: string }[];
  }[];
}

const COLORS = ["#3B82F6", "#F59E0B", "#F53642"];

const getHealthColor = (score: number) => {
  if (score >= 80) return "#2ADE6B";
  if (score >= 50) return "#F59E0B";
  return "#F53642";
};

const statusVariant = (s: string) => {
  if (s === "healthy") return "healthy" as const;
  if (s === "warning") return "warning" as const;
  if (s === "critical") return "critical" as const;
  return "default" as const;
};

export function ComparisonCharts({ equipmentList }: { equipmentList: EquipmentData[] }) {
  // Health Score Comparison
  const healthData = equipmentList.map((eq) => ({
    name: eq.name,
    health_score: eq.health_score,
  }));

  // Find shared sensor types
  const sensorTypesByEquipment = equipmentList.map((eq) =>
    new Set(eq.sensorReadings.map((sr) => sr.type))
  );
  const sharedTypes = [...(sensorTypesByEquipment[0] ?? [])].filter((type) =>
    sensorTypesByEquipment.every((set) => set.has(type))
  );

  return (
    <div className="space-y-8">
      {/* Health Score Comparison */}
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-6">
        <h3 className="mb-4 text-base font-semibold text-[#1A2332]">Health Score Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={healthData}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5A6578" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#5A6578" }} />
            <Tooltip />
            <Bar dataKey="health_score" radius={[4, 4, 0, 0]}>
              {healthData.map((d, i) => (
                <Cell key={i} fill={getHealthColor(d.health_score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sensor Trend Comparison */}
      {sharedTypes.map((sensorType) => {
        const firstSensor = equipmentList[0]?.sensorReadings.find((sr) => sr.type === sensorType);
        const unit = firstSensor?.unit ?? "";

        // Build merged time series
        const allTimestamps = new Set<string>();
        equipmentList.forEach((eq) => {
          const sr = eq.sensorReadings.find((s) => s.type === sensorType);
          sr?.readings.forEach((r) => {
            allTimestamps.add(r.recorded_at.slice(0, 16));
          });
        });
        const sortedTimestamps = [...allTimestamps].sort();

        const chartData = sortedTimestamps.map((ts) => {
          const point: Record<string, string | number> = {
            time: format(new Date(ts), "MM/dd HH:mm"),
          };
          equipmentList.forEach((eq) => {
            const sr = eq.sensorReadings.find((s) => s.type === sensorType);
            const reading = sr?.readings.find((r) => r.recorded_at.slice(0, 16) === ts);
            point[eq.name] = reading?.value ?? 0;
          });
          return point;
        });

        return (
          <div key={sensorType} className="rounded-xl border border-[#E8ECF1] bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-[#1A2332]">
              {sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} Comparison ({unit})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#5A6578" }} />
                <YAxis tick={{ fontSize: 12, fill: "#5A6578" }} />
                <Tooltip />
                <Legend />
                {equipmentList.map((eq, i) => (
                  <Line
                    key={eq.id}
                    type="monotone"
                    dataKey={eq.name}
                    stroke={COLORS[i % COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}

      {/* Summary Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E8ECF1] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E8ECF1] bg-[#F5F6FA]">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                Metric
              </th>
              {equipmentList.map((eq) => (
                <th
                  key={eq.id}
                  className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]"
                >
                  {eq.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#E8ECF1]">
              <td className="px-4 py-3 font-medium text-[#1A2332]">Health Score</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="px-4 py-3" style={{ color: getHealthColor(eq.health_score) }}>
                  <span className="font-semibold">{eq.health_score}</span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-[#E8ECF1] bg-[#F9FAFB]">
              <td className="px-4 py-3 font-medium text-[#1A2332]">Status</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="px-4 py-3">
                  <Badge variant={statusVariant(eq.status)}>{eq.status}</Badge>
                </td>
              ))}
            </tr>
            <tr className="border-b border-[#E8ECF1]">
              <td className="px-4 py-3 font-medium text-[#1A2332]">Active Alerts</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="px-4 py-3 text-[#1A2332]">{eq.alertCount}</td>
              ))}
            </tr>
            <tr className="border-b border-[#E8ECF1] bg-[#F9FAFB]">
              <td className="px-4 py-3 font-medium text-[#1A2332]">Active Predictions</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="px-4 py-3 text-[#1A2332]">{eq.predictionCount}</td>
              ))}
            </tr>
            <tr className="border-b border-[#E8ECF1]">
              <td className="px-4 py-3 font-medium text-[#1A2332]">Last Maintenance</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="px-4 py-3 text-[#5A6578]">
                  {eq.last_maintenance ? format(new Date(eq.last_maintenance), "MMM dd, yyyy") : "—"}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[#E8ECF1] bg-[#F9FAFB]">
              <td className="px-4 py-3 font-medium text-[#1A2332]">Install Date</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="px-4 py-3 text-[#5A6578]">
                  {eq.install_date ? format(new Date(eq.install_date), "MMM dd, yyyy") : "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
