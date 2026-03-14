"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markAllAlertsRead() {
  const supabase = await createClient();

  const { error } = await supabase
    .from("alerts")
    .update({
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
    })
    .eq("status", "new");

  if (error) {
    console.error("Error marking all alerts read:", error);
    return { error: error.message };
  }

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  return { success: true };
}
