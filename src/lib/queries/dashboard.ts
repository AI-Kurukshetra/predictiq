import { createClient } from "@/lib/supabase/server";

async function getEquipmentIdsForFacility(facilityId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("equipment")
    .select("id")
    .eq("facility_id", facilityId);
  return (data ?? []).map((e) => e.id);
}

export async function getDashboardStats(facilityId?: string) {
  const supabase = await createClient();

  if (facilityId) {
    const equipmentIds = await getEquipmentIdsForFacility(facilityId);

    const [totalEquipmentResult, criticalAlertsResult, activePredictionsResult, openWorkOrdersResult] =
      await Promise.all([
        supabase.from("equipment").select("*", { count: "exact", head: true }).eq("facility_id", facilityId),
        supabase.from("alerts").select("*", { count: "exact", head: true }).eq("severity", "critical").in("equipment_id", equipmentIds),
        supabase.from("predictions").select("*", { count: "exact", head: true }).eq("status", "active").in("equipment_id", equipmentIds),
        supabase.from("work_orders").select("*", { count: "exact", head: true }).neq("status", "cancelled").in("equipment_id", equipmentIds),
      ]);

    return {
      totalEquipment: totalEquipmentResult.count ?? 0,
      criticalAlerts: criticalAlertsResult.count ?? 0,
      activePredictions: activePredictionsResult.count ?? 0,
      openWorkOrders: openWorkOrdersResult.count ?? 0,
    };
  }

  const [totalEquipmentResult, criticalAlertsResult, activePredictionsResult, openWorkOrdersResult] =
    await Promise.all([
      supabase.from("equipment").select("*", { count: "exact", head: true }),
      supabase.from("alerts").select("*", { count: "exact", head: true }).eq("severity", "critical"),
      supabase.from("predictions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).neq("status", "cancelled"),
    ]);

  if (totalEquipmentResult.error) {
    console.error("Error fetching total equipment count:", totalEquipmentResult.error);
  }

  return {
    totalEquipment: totalEquipmentResult.count ?? 0,
    criticalAlerts: criticalAlertsResult.count ?? 0,
    activePredictions: activePredictionsResult.count ?? 0,
    openWorkOrders: openWorkOrdersResult.count ?? 0,
  };
}

export async function getRecentAlerts(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("alerts")
    .select("*, equipment(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent alerts:", error);
    return [];
  }

  return data ?? [];
}

export async function getUpcomingPredictions(limit = 3) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("predictions")
    .select("*, equipment(name)")
    .eq("status", "active")
    .order("days_until_failure", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching upcoming predictions:", error);
    return [];
  }

  return data ?? [];
}
