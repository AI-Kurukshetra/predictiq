import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askGeminiJSON } from "@/lib/ai/llm";
import { ROOT_CAUSE_PROMPT } from "@/lib/ai/prompts";
import { buildSensorTrendSummary } from "@/lib/ai/context-builders";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { predictionId } = await request.json();

    const { data: prediction } = await supabase
      .from("predictions").select("*, equipment(name, type, health_score, status)").eq("id", predictionId).single();

    if (!prediction) return NextResponse.json({ error: "Prediction not found" }, { status: 404 });

    const { data: sensors } = await supabase
      .from("sensors").select("*").eq("equipment_id", prediction.equipment_id);

    const sensorSummaries = await Promise.all(
      (sensors ?? []).map(async (s) => {
        const { data: readings } = await supabase
          .from("sensor_readings").select("value, recorded_at, is_anomaly")
          .eq("sensor_id", s.id).order("recorded_at", { ascending: false }).limit(50);
        return `${s.type} (${s.unit}): ${buildSensorTrendSummary(readings ?? [], s.type, s.max_threshold ?? 100)}`;
      })
    );

    const eqName = Array.isArray(prediction.equipment)
      ? prediction.equipment[0]?.name : (prediction.equipment as { name?: string })?.name;

    const context = `Equipment: ${eqName}
Prediction: ${prediction.failure_type}
Confidence: ${Math.round(prediction.confidence)}%
Severity: ${prediction.severity}
Days until failure: ${prediction.days_until_failure}
Contributing factors: ${Array.isArray(prediction.contributing_factors) ? (prediction.contributing_factors as string[]).join(", ") : "N/A"}
Recommended action: ${prediction.recommended_action}

Sensor trends:
${sensorSummaries.join("\n")}`;

    const result = await askGeminiJSON(ROOT_CAUSE_PROMPT + "\n\n" + context);
    return NextResponse.json(result ?? { primaryCause: "Unable to determine", secondaryCauses: [], evidence: [], timeline: "Insufficient data", preventionSteps: [], estimatedUrgency: "Unknown" });
  } catch (error: unknown) { const err = error as { message?: string }; console.error("AI route error:", err.message ?? error);
    return NextResponse.json({ error: "Failed to analyze root cause" }, { status: 500 });
  }
}
