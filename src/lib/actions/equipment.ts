"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEquipment(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const facility_id = formData.get("facility_id") as string;
  const model = (formData.get("model") as string) || null;
  const serial_number = (formData.get("serial_number") as string) || null;
  const location_zone = (formData.get("location_zone") as string) || null;
  const install_date = (formData.get("install_date") as string) || null;

  if (!name || !type || !facility_id) {
    throw new Error("Name, type, and facility are required");
  }

  const { data: equipment, error } = await supabase
    .from("equipment")
    .insert({
      name,
      type,
      facility_id,
      model,
      serial_number,
      location_zone,
      install_date,
      health_score: 100,
      status: "healthy",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create default sensors
  await supabase.from("sensors").insert([
    { equipment_id: equipment.id, type: "vibration", unit: "mm/s", min_threshold: 0, max_threshold: 10, is_active: true },
    { equipment_id: equipment.id, type: "temperature", unit: "°C", min_threshold: 20, max_threshold: 85, is_active: true },
    { equipment_id: equipment.id, type: "pressure", unit: "PSI", min_threshold: 30, max_threshold: 150, is_active: true },
  ]);

  revalidatePath("/equipment");
  redirect("/equipment");
}

export async function updateEquipment(equipmentId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const facility_id = formData.get("facility_id") as string;
  const model = (formData.get("model") as string) || null;
  const serial_number = (formData.get("serial_number") as string) || null;
  const location_zone = (formData.get("location_zone") as string) || null;
  const install_date = (formData.get("install_date") as string) || null;

  const { error } = await supabase
    .from("equipment")
    .update({ name, type, facility_id, model, serial_number, location_zone, install_date })
    .eq("id", equipmentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${equipmentId}`);
  redirect("/equipment");
}

export async function deleteEquipment(equipmentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("equipment")
    .delete()
    .eq("id", equipmentId);

  if (error) {
    console.error("Error deleting equipment:", error);
    return { error: error.message };
  }

  revalidatePath("/equipment");
  return { success: true };
}
