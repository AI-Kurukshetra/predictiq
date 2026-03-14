import { createClient } from "@/lib/supabase/server";

const STATUS_PRIORITY: Record<string, number> = {
  critical: 0,
  warning: 1,
  healthy: 2,
};

export async function getEquipmentList(facilityId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("equipment")
    .select(
      "id, name, type, model, health_score, status, location_zone, last_maintenance, install_date, facility_id, facilities(name)"
    );

  if (facilityId) {
    query = query.eq("facility_id", facilityId);
  }

  const { data, error } = await query.order("name", { ascending: true });

  if (error) {
    console.error("Error fetching equipment list:", error);
    return [];
  }

  return (data ?? []).sort((a, b) => {
    const aPriority = STATUS_PRIORITY[a.status] ?? Number.MAX_SAFE_INTEGER;
    const bPriority = STATUS_PRIORITY[b.status] ?? Number.MAX_SAFE_INTEGER;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.name.localeCompare(b.name);
  });
}

export async function getEquipmentById(id: string) {
  const supabase = await createClient();

  const { data: equipment, error: equipmentError } = await supabase
    .from("equipment")
    .select("*, facilities(name)")
    .eq("id", id)
    .single();

  if (equipmentError) {
    console.error("Error fetching equipment by id:", equipmentError);
    return {
      equipment: null,
      sensors: [],
      latestReadings: [],
      activePredictions: [],
      recentAlerts: [],
    };
  }

  const { data: sensors, error: sensorsError } = await supabase
    .from("sensors")
    .select("*")
    .eq("equipment_id", id);

  if (sensorsError) {
    console.error("Error fetching sensors:", sensorsError);
  }

  const sensorList = sensors ?? [];

  const readingResults = await Promise.all(
    sensorList.map(async (sensor) => {
      const { data: readings, error: readingsError } = await supabase
        .from("sensor_readings")
        .select("*")
        .eq("sensor_id", sensor.id)
        .order("recorded_at", { ascending: false })
        .limit(50);

      if (readingsError) {
        console.error(`Error fetching readings for sensor ${sensor.id}:`, readingsError);
        return {
          sensor_id: sensor.id,
          readings: [],
        };
      }

      return {
        sensor_id: sensor.id,
        readings: readings ?? [],
      };
    })
  );

  const { data: activePredictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("*")
    .eq("equipment_id", id)
    .eq("status", "active");

  if (predictionsError) {
    console.error("Error fetching active predictions:", predictionsError);
  }

  const { data: recentAlerts, error: alertsError } = await supabase
    .from("alerts")
    .select("*")
    .eq("equipment_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (alertsError) {
    console.error("Error fetching recent alerts:", alertsError);
  }

  return {
    equipment,
    sensors: sensorList,
    latestReadings: readingResults,
    activePredictions: activePredictions ?? [],
    recentAlerts: recentAlerts ?? [],
  };
}

export async function getEquipmentStats() {
  const supabase = await createClient();

  const { count: totalCount, error: totalError } = await supabase
    .from("equipment")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error("Error fetching total equipment count:", totalError);
  }

  const [healthyResult, warningResult, criticalResult] = await Promise.all([
    supabase.from("equipment").select("*", { count: "exact", head: true }).eq("status", "healthy"),
    supabase.from("equipment").select("*", { count: "exact", head: true }).eq("status", "warning"),
    supabase.from("equipment").select("*", { count: "exact", head: true }).eq("status", "critical"),
  ]);

  if (healthyResult.error) {
    console.error("Error fetching healthy equipment count:", healthyResult.error);
  }

  if (warningResult.error) {
    console.error("Error fetching warning equipment count:", warningResult.error);
  }

  if (criticalResult.error) {
    console.error("Error fetching critical equipment count:", criticalResult.error);
  }

  return {
    total: totalCount ?? 0,
    healthy: healthyResult.count ?? 0,
    warning: warningResult.count ?? 0,
    critical: criticalResult.count ?? 0,
  };
}
