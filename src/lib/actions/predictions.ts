"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";

const SEVERITY_TO_PRIORITY: Record<string, string> = {
  critical: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
};

export async function resolvePrediction(predictionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("predictions")
    .update({ status: "resolved" })
    .eq("id", predictionId);

  if (error) {
    console.error("Error resolving prediction:", error);
    return { error: error.message };
  }

  revalidatePath("/predictions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function dismissPrediction(predictionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("predictions")
    .update({ status: "false_alarm" })
    .eq("id", predictionId);

  if (error) {
    console.error("Error dismissing prediction:", error);
    return { error: error.message };
  }

  revalidatePath("/predictions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createWorkOrderFromPrediction(predictionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: prediction, error: fetchError } = await supabase
    .from("predictions")
    .select("*, equipment(name)")
    .eq("id", predictionId)
    .single();

  if (fetchError || !prediction) {
    console.error("Error fetching prediction:", fetchError);
    return { error: fetchError?.message ?? "Prediction not found" };
  }

  const priority = SEVERITY_TO_PRIORITY[prediction.severity] ?? "medium";

  const { data: workOrder, error: insertError } = await supabase
    .from("work_orders")
    .insert({
      title: `Predicted: ${prediction.failure_type}`,
      description: prediction.recommended_action,
      equipment_id: prediction.equipment_id,
      prediction_id: predictionId,
      priority,
      status: "open",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Error creating work order from prediction:", insertError);
    return { error: insertError.message };
  }

  revalidatePath("/predictions");
  revalidatePath("/work-orders");
  revalidatePath("/dashboard");
  await logAudit("CREATE_WO_FROM_PREDICTION", "prediction", predictionId);
  return { success: true, workOrderId: workOrder.id };
}
