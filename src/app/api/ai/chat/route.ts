import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askGeminiWithContext } from "@/lib/ai/llm";
import { EQUIPMENT_ANALYST_PROMPT } from "@/lib/ai/prompts";
import { buildEquipmentContext, buildDashboardContext } from "@/lib/ai/context-builders";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { message, equipmentId } = await request.json();

    let context: string;

    if (equipmentId) {
      const [{ data: equipment }, { data: sensors }] = await Promise.all([
        supabase.from("equipment").select("*").eq("id", equipmentId).single(),
        supabase.from("sensors").select("*").eq("equipment_id", equipmentId),
      ]);

      const sensorList = sensors ?? [];
      const readingResults = await Promise.all(
        sensorList.map(async (s) => {
          const { data } = await supabase
            .from("sensor_readings").select("value, recorded_at, is_anomaly")
            .eq("sensor_id", s.id).order("recorded_at", { ascending: false }).limit(20);
          return { sensor_id: s.id, readings: data ?? [] };
        })
      );

      const { data: predictions } = await supabase
        .from("predictions").select("*").eq("equipment_id", equipmentId).eq("status", "active");
      const { data: alerts } = await supabase
        .from("alerts").select("*").eq("equipment_id", equipmentId).order("created_at", { ascending: false }).limit(5);

      context = buildEquipmentContext(
        equipment ?? {},
        sensorList,
        readingResults,
        predictions ?? [],
        alerts ?? []
      );
    } else {
      const [{ count: totalEquipment }, { count: criticalAlerts }, { count: activePredictions }, { count: openWorkOrders }] = await Promise.all([
        supabase.from("equipment").select("*", { count: "exact", head: true }),
        supabase.from("alerts").select("*", { count: "exact", head: true }).eq("severity", "critical"),
        supabase.from("predictions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("work_orders").select("*", { count: "exact", head: true }).neq("status", "cancelled"),
      ]);

      const { data: recentAlerts } = await supabase
        .from("alerts").select("*, equipment(name)").order("created_at", { ascending: false }).limit(5);
      const { data: topPredictions } = await supabase
        .from("predictions").select("*, equipment(name)").eq("status", "active").order("days_until_failure", { ascending: true }).limit(3);

      context = buildDashboardContext(
        { totalEquipment: totalEquipment ?? 0, criticalAlerts: criticalAlerts ?? 0, activePredictions: activePredictions ?? 0, openWorkOrders: openWorkOrders ?? 0 },
        recentAlerts ?? [],
        topPredictions ?? []
      );
    }

    const response = await askGeminiWithContext(EQUIPMENT_ANALYST_PROMPT + "\n\n" + context, message);
    return NextResponse.json({ response, timestamp: new Date().toISOString() });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("AI chat route error:", err.message ?? error);
    return NextResponse.json({ error: err.message ?? "Failed to get AI response" }, { status: 500 });
  }
}
