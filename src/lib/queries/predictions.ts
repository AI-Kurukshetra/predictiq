import { createClient } from "@/lib/supabase/server";

export async function getPredictions(filters?: { severity?: string; status?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("predictions")
    .select("*, equipment(name, type, health_score, status)");

  if (filters?.severity) {
    query = query.eq("severity", filters.severity);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.order("days_until_failure", { ascending: true });

  if (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }

  return data ?? [];
}

export async function getPredictionStats() {
  const supabase = await createClient();

  const [totalResult, criticalResult, highResult, mediumResult, lowResult] = await Promise.all([
    supabase.from("predictions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("severity", "critical"),
    supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("severity", "high"),
    supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("severity", "medium"),
    supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("severity", "low"),
  ]);

  if (totalResult.error) {
    console.error("Error fetching total active predictions:", totalResult.error);
  }
  if (criticalResult.error) {
    console.error("Error fetching critical predictions:", criticalResult.error);
  }
  if (highResult.error) {
    console.error("Error fetching high predictions:", highResult.error);
  }
  if (mediumResult.error) {
    console.error("Error fetching medium predictions:", mediumResult.error);
  }
  if (lowResult.error) {
    console.error("Error fetching low predictions:", lowResult.error);
  }

  const { data: activePredictions, error: avgError } = await supabase
    .from("predictions")
    .select("confidence")
    .eq("status", "active");

  if (avgError) {
    console.error("Error fetching predictions for average confidence:", avgError);
  }

  const confidenceValues = activePredictions ?? [];
  const averageConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((sum, p) => sum + (p.confidence ?? 0), 0) / confidenceValues.length
      : 0;

  return {
    total: totalResult.count ?? 0,
    critical: criticalResult.count ?? 0,
    high: highResult.count ?? 0,
    medium: mediumResult.count ?? 0,
    low: lowResult.count ?? 0,
    averageConfidence,
  };
}

export async function getPredictionById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("predictions")
    .select("*, equipment(name, type, health_score, status, facilities(name))")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching prediction by id:", error);
    return null;
  }

  return data;
}
