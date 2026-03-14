import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askGeminiJSON } from "@/lib/ai/gemini";
import { MAINTENANCE_ADVISOR_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { facilityId } = await request.json();

    let equipmentQuery = supabase.from("equipment").select("name, type, health_score, status, facility_id");
    if (facilityId) equipmentQuery = equipmentQuery.eq("facility_id", facilityId);
    const { data: equipment } = await equipmentQuery;

    const { data: predictions } = await supabase
      .from("predictions").select("*, equipment(name)").eq("status", "active").order("days_until_failure", { ascending: true });

    const { data: workOrders } = await supabase
      .from("work_orders").select("title, status, priority, equipment_id").in("status", ["open", "in_progress"]);

    const context = `Equipment (${(equipment ?? []).length} total):
${(equipment ?? []).map((e) => `- ${e.name}: health ${e.health_score}/100, status ${e.status}`).join("\n")}

Active Predictions (${(predictions ?? []).length}):
${(predictions ?? []).map((p) => {
  const name = Array.isArray(p.equipment) ? p.equipment[0]?.name : (p.equipment as { name?: string })?.name;
  return `- ${name}: ${p.failure_type}, ${p.days_until_failure} days, confidence ${Math.round(p.confidence)}%`;
}).join("\n")}

Open Work Orders (${(workOrders ?? []).length}):
${(workOrders ?? []).map((w) => `- ${w.title}: ${w.priority} priority, status ${w.status}`).join("\n")}`;

    const result = await askGeminiJSON<{ recommendations: unknown[] }>(MAINTENANCE_ADVISOR_PROMPT + "\n\n" + context);
    return NextResponse.json(result ?? { recommendations: [] });
  } catch (error: unknown) { const err = error as { message?: string }; console.error("AI route error:", err.message ?? error);
    return NextResponse.json({ error: "Failed to generate maintenance plan" }, { status: 500 });
  }
}
