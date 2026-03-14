"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";

export async function acknowledgeAlert(alertId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("alerts")
    .update({
      status: "acknowledged",
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq("id", alertId);

  if (error) {
    console.error("Error acknowledging alert:", error);
    return { error: error.message };
  }

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  await logAudit("ACKNOWLEDGE_ALERT", "alert", alertId);
  return { success: true };
}

export async function resolveAlert(alertId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("alerts")
    .update({ status: "resolved" })
    .eq("id", alertId);

  if (error) {
    console.error("Error resolving alert:", error);
    return { error: error.message };
  }

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  await logAudit("RESOLVE_ALERT", "alert", alertId);
  return { success: true };
}

export async function dismissAlert(alertId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("alerts")
    .update({ status: "dismissed" })
    .eq("id", alertId);

  if (error) {
    console.error("Error dismissing alert:", error);
    return { error: error.message };
  }

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  return { success: true };
}
