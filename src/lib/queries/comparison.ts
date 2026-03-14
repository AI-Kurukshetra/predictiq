import { createClient } from "@/lib/supabase/server";

export async function getEquipmentForComparison(ids: string[]) {
  const supabase = await createClient();

  const results = await Promise.all(
    ids.map(async (id) => {
      const { data: equipment } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", id)
        .single();

      if (!equipment) return null;

      const { data: sensors } = await supabase
        .from("sensors")
        .select("*")
        .eq("equipment_id", id);

      const sensorList = sensors ?? [];

      const readingResults = await Promise.all(
        sensorList.map(async (sensor) => {
          const { data: readings } = await supabase
            .from("sensor_readings")
            .select("*")
            .eq("sensor_id", sensor.id)
            .order("recorded_at", { ascending: false })
            .limit(50);
          return { sensor_id: sensor.id, type: sensor.type, unit: sensor.unit, readings: readings ?? [] };
        })
      );

      const { count: alertCount } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("equipment_id", id);

      const { count: predictionCount } = await supabase
        .from("predictions")
        .select("*", { count: "exact", head: true })
        .eq("equipment_id", id)
        .eq("status", "active");

      return {
        ...equipment,
        sensors: sensorList,
        sensorReadings: readingResults,
        alertCount: alertCount ?? 0,
        predictionCount: predictionCount ?? 0,
      };
    })
  );

  return results.filter(Boolean);
}
