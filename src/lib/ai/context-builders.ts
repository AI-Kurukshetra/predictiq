interface SensorReading {
  value: number;
  recorded_at: string;
  is_anomaly?: boolean;
}

interface Sensor {
  id: string;
  type: string;
  unit: string;
  min_threshold: number | null;
  max_threshold: number | null;
}

export function buildEquipmentContext(
  equipment: Record<string, unknown>,
  sensors: Sensor[],
  readings: { sensor_id: string; readings: SensorReading[] }[],
  predictions: Record<string, unknown>[],
  alerts: Record<string, unknown>[]
): string {
  const lines: string[] = [];

  lines.push(`Equipment: ${equipment.name} | Type: ${equipment.type} | Health: ${equipment.health_score}/100 | Status: ${equipment.status}`);
  lines.push(`Facility: ${equipment.facility_id} | Installed: ${equipment.install_date ?? "unknown"} | Last Maintenance: ${equipment.last_maintenance ?? "unknown"}`);
  lines.push("");

  lines.push("Sensors:");
  for (const sensor of sensors) {
    const sensorReadings = readings.find((r) => r.sensor_id === sensor.id)?.readings ?? [];
    const summary = buildSensorTrendSummary(sensorReadings, sensor.type, sensor.max_threshold ?? 100);
    lines.push(`- ${sensor.type} (${sensor.unit}): threshold ${sensor.min_threshold ?? 0}-${sensor.max_threshold ?? "N/A"} | ${summary}`);
  }
  lines.push("");

  if (predictions.length > 0) {
    lines.push("Active Predictions:");
    for (const p of predictions) {
      lines.push(`- ${p.failure_type}: confidence ${Math.round(Number(p.confidence))}%, ${p.days_until_failure} days, severity ${p.severity}`);
      if (Array.isArray(p.contributing_factors)) {
        lines.push(`  Contributing factors: ${(p.contributing_factors as string[]).join(", ")}`);
      }
    }
    lines.push("");
  }

  if (alerts.length > 0) {
    lines.push("Recent Alerts:");
    for (const a of alerts) {
      lines.push(`- [${a.severity}] ${a.title}: ${a.message}`);
    }
  }

  return lines.join("\n");
}

export function buildDashboardContext(
  stats: Record<string, number>,
  alerts: Record<string, unknown>[],
  predictions: Record<string, unknown>[]
): string {
  const lines: string[] = [];

  lines.push(`System Overview: ${stats.totalEquipment} total equipment, ${stats.criticalAlerts} critical alerts, ${stats.activePredictions} active predictions, ${stats.openWorkOrders} open work orders`);
  lines.push("");

  if (alerts.length > 0) {
    lines.push("Recent Alerts:");
    for (const a of alerts) {
      const eqName = typeof a.equipment === "object" && a.equipment !== null
        ? (Array.isArray(a.equipment) ? (a.equipment[0] as { name?: string })?.name : (a.equipment as { name?: string })?.name) ?? "Unknown"
        : "Unknown";
      lines.push(`- [${a.severity}] ${eqName}: ${a.title}`);
    }
    lines.push("");
  }

  if (predictions.length > 0) {
    lines.push("Upcoming Predictions:");
    for (const p of predictions) {
      const eqName = typeof p.equipment === "object" && p.equipment !== null
        ? (Array.isArray(p.equipment) ? (p.equipment[0] as { name?: string })?.name : (p.equipment as { name?: string })?.name) ?? "Unknown"
        : "Unknown";
      lines.push(`- ${eqName}: ${p.failure_type}, ${p.days_until_failure} days, confidence ${Math.round(Number(p.confidence))}%`);
    }
  }

  return lines.join("\n");
}

export function buildSensorTrendSummary(
  readings: SensorReading[],
  sensorType: string,
  threshold: number
): string {
  if (readings.length === 0) return "no data";

  const values = readings.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // Trend: compare first half avg to second half avg
  const half = Math.floor(values.length / 2);
  const firstHalf = values.slice(half);
  const secondHalf = values.slice(0, half);
  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : avg;
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : avg;

  let trend = "stable";
  if (secondAvg > firstAvg * 1.05) trend = "trending UP";
  else if (secondAvg < firstAvg * 0.95) trend = "trending DOWN";

  const anomalyCount = readings.filter((r) => r.is_anomaly).length;

  return `latest ${values[0]?.toFixed(1)}, avg ${avg.toFixed(1)}, range ${min.toFixed(1)}-${max.toFixed(1)}, ${trend}, ${anomalyCount} anomalies`;
}
