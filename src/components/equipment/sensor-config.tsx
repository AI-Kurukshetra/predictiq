"use client";

import { useState, useTransition } from "react";
import { Activity, Thermometer, Gauge, Zap } from "lucide-react";
import { updateSensorThresholds } from "@/lib/actions/sensors";

interface Sensor {
  id: string;
  type: string;
  unit: string;
  min_threshold: number | null;
  max_threshold: number | null;
  is_active: boolean;
}

interface SensorConfigProps {
  sensors: Sensor[];
  latestReadings: Record<string, number | null>;
  canEdit: boolean;
}

const sensorIcons: Record<string, typeof Activity> = {
  vibration: Activity,
  temperature: Thermometer,
  pressure: Gauge,
  rpm: Zap,
};

function getValueColor(value: number | null, min: number | null, max: number | null) {
  if (value == null) return "text-[#8C95A6]";
  if (max != null && value >= max) return "text-[#8B2252]";
  if (max != null && value >= max * 0.9) return "text-[#0D8070]";
  if (min != null && value <= min) return "text-[#8B2252]";
  if (min != null && value <= min * 1.1) return "text-[#0D8070]";
  return "text-[#0D8070]";
}

function SensorRow({
  sensor,
  currentValue,
  canEdit,
}: {
  sensor: Sensor;
  currentValue: number | null;
  canEdit: boolean;
}) {
  const [minVal, setMinVal] = useState(sensor.min_threshold ?? 0);
  const [maxVal, setMaxVal] = useState(sensor.max_threshold ?? 100);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const Icon = sensorIcons[sensor.type] ?? Activity;

  return (
    <div className="flex flex-col gap-3 border-b border-[#E8ECF1] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#5A6578]" />
        <div>
          <p className="text-sm font-medium text-[#1A2332]">
            {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} ({sensor.unit})
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className={sensor.is_active ? "text-[#0D8070]" : "text-[#8C95A6]"}>
              {sensor.is_active ? "● Active" : "● Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-xs text-[#5A6578]">Current</p>
          <p className={`text-sm font-semibold ${getValueColor(currentValue, sensor.min_threshold, sensor.max_threshold)}`}>
            {currentValue != null ? `${currentValue.toFixed(1)} ${sensor.unit}` : "—"}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-[#5A6578]">Min</p>
          {canEdit ? (
            <input
              type="number"
              value={minVal}
              onChange={(e) => setMinVal(Number(e.target.value))}
              className="w-20 rounded border border-[#E8ECF1] px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-[#0D8070]"
            />
          ) : (
            <p className="text-sm text-[#1A2332]">{sensor.min_threshold ?? "—"}</p>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-[#5A6578]">Max</p>
          {canEdit ? (
            <input
              type="number"
              value={maxVal}
              onChange={(e) => setMaxVal(Number(e.target.value))}
              className="w-20 rounded border border-[#E8ECF1] px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-[#0D8070]"
            />
          ) : (
            <p className="text-sm text-[#1A2332]">{sensor.max_threshold ?? "—"}</p>
          )}
        </div>

        {canEdit && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setSaveStatus("idle");
              setErrorMsg(null);
              startTransition(async () => {
                const result = await updateSensorThresholds(sensor.id, minVal, maxVal);
                if (result.error) {
                  setSaveStatus("error");
                  setErrorMsg(result.error);
                } else {
                  setSaveStatus("saved");
                  setTimeout(() => setSaveStatus("idle"), 2000);
                }
              });
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              saveStatus === "saved"
                ? "bg-[#E6F5F0] text-[#0A5E52]"
                : saveStatus === "error"
                  ? "bg-[#F0E4E8] text-[#6B1D3A]"
                  : "bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#c5d8f8]"
            }`}
          >
            {isPending ? "..." : saveStatus === "saved" ? "\u2713 Saved" : saveStatus === "error" ? "Failed" : "Save"}
          </button>
        )}
      </div>
      {errorMsg && (
        <p className="px-4 pb-2 text-xs text-[#6B1D3A]">{errorMsg}</p>
      )}
    </div>
  );
}

export function SensorConfig({ sensors, latestReadings, canEdit }: SensorConfigProps) {
  return (
    <div className="rounded-xl border border-[#E8ECF1] bg-white">
      {sensors.map((sensor) => (
        <SensorRow
          key={sensor.id}
          sensor={sensor}
          currentValue={latestReadings[sensor.id] ?? null}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
