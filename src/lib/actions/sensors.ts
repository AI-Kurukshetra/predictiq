"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSensorThresholds(
  sensorId: string,
  minThreshold: number,
  maxThreshold: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sensors")
    .update({ min_threshold: minThreshold, max_threshold: maxThreshold })
    .eq("id", sensorId);

  if (error) {
    console.error("Error updating sensor thresholds:", error);
    return { error: error.message };
  }

  revalidatePath("/equipment");
  return { success: true };
}
