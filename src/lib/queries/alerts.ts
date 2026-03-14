import { createClient } from "@/lib/supabase/server";

export async function getAlerts(filters?: {
  severity?: string;
  status?: string;
  facilityId?: string;
}) {
  const supabase = await createClient();

  let equipmentIds: string[] | null = null;
  if (filters?.facilityId) {
    const { data } = await supabase
      .from("equipment")
      .select("id")
      .eq("facility_id", filters.facilityId);
    equipmentIds = (data ?? []).map((e) => e.id);
  }

  let query = supabase
    .from("alerts")
    .select("*, equipment(name)")
    .order("created_at", { ascending: false });

  if (filters?.severity) {
    query = query.eq("severity", filters.severity);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (equipmentIds) {
    query = query.in("equipment_id", equipmentIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }

  const alerts = data ?? [];

  // Sort: 'new' status first, then by created_at desc (already ordered by DB)
  alerts.sort((a, b) => {
    if (a.status === "new" && b.status !== "new") return -1;
    if (a.status !== "new" && b.status === "new") return 1;
    return 0;
  });

  return alerts;
}

export async function getAlertStats() {
  const supabase = await createClient();

  const [
    totalResult,
    criticalResult,
    majorResult,
    minorResult,
    infoResult,
    newResult,
    acknowledgedResult,
    resolvedResult,
  ] = await Promise.all([
    supabase.from("alerts").select("*", { count: "exact", head: true }),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("severity", "critical"),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("severity", "major"),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("severity", "minor"),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("severity", "info"),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "acknowledged"),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved"),
  ]);

  if (totalResult.error) {
    console.error("Error fetching alert stats:", totalResult.error);
  }

  return {
    total: totalResult.count ?? 0,
    bySeverity: {
      critical: criticalResult.count ?? 0,
      major: majorResult.count ?? 0,
      minor: minorResult.count ?? 0,
      info: infoResult.count ?? 0,
    },
    byStatus: {
      new: newResult.count ?? 0,
      acknowledged: acknowledgedResult.count ?? 0,
      resolved: resolvedResult.count ?? 0,
    },
  };
}
