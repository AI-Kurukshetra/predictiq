import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askGeminiJSON } from "@/lib/ai/gemini";
import { ANOMALY_EXPLAINER_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sensorId, equipmentId } = await request.json();

    const [{ data: sensor }, { data: equipment }] = await Promise.all([
      supabase.from("sensors").select("*").eq("id", sensorId).single(),
      supabase.from("equipment").select("name, type").eq("id", equipmentId).single(),
    ]);

    const { data: readings } = await supabase
      .from("sensor_readings").select("value, recorded_at, is_anomaly")
      .eq("sensor_id", sensorId).order("recorded_at", { ascending: false }).limit(50);

    const anomalies = (readings ?? []).filter((r) => r.is_anomaly);
    const recentValues = (readings ?? []).slice(0, 10).map((r) => r.value);

    const context = `Equipment: ${equipment?.name} (${equipment?.type})
Sensor: ${sensor?.type} (${sensor?.unit})
Thresholds: min=${sensor?.min_threshold}, max=${sensor?.max_threshold}
Recent values: ${recentValues.join(", ")}
Anomaly values: ${anomalies.map((a) => `${a.value} at ${a.recorded_at}`).join("; ")}
Total anomalies: ${anomalies.length} out of ${(readings ?? []).length} readings`;

    const result = await askGeminiJSON(ANOMALY_EXPLAINER_PROMPT + "\n\n" + context);
    return NextResponse.json(result ?? { summary: "Unable to analyze", deviation: "N/A", possibleCauses: [], riskLevel: "Unknown", immediateAction: "Consult maintenance team" });
  } catch (error: unknown) { const err = error as { message?: string }; console.error("AI route error:", err.message ?? error);
    return NextResponse.json({ error: "Failed to analyze anomaly" }, { status: 500 });
  }
}
