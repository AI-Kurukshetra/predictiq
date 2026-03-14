"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/actions/audit";

export async function createWorkOrder(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const title = formData.get("title") as string;
  const equipment_id = formData.get("equipment_id") as string;
  const description = (formData.get("description") as string) || null;
  const priority = (formData.get("priority") as string) || "medium";
  const assigned_to_name = (formData.get("assigned_to_name") as string) || null;
  const due_date = (formData.get("due_date") as string) || null;
  const estimated_cost = formData.get("estimated_cost")
    ? Number(formData.get("estimated_cost"))
    : null;
  const notes = (formData.get("notes") as string) || null;

  if (!title || !equipment_id) {
    throw new Error("Title and equipment are required");
  }

  const { error } = await supabase.from("work_orders").insert({
    title,
    equipment_id,
    description,
    priority,
    assigned_to_name,
    due_date,
    estimated_cost,
    notes,
    status: "open",
    created_by: user.id,
  });

  if (error) {
    console.error("Error creating work order:", error);
    throw new Error(error.message);
  }

  revalidatePath("/work-orders");
  revalidatePath("/dashboard");
  await logAudit("CREATE_WORK_ORDER", "work_order", undefined, { title });
  redirect("/work-orders");
}

export async function updateWorkOrderStatus(workOrderId: string, newStatus: string) {
  const supabase = await createClient();

  const updateData: Record<string, string> = { status: newStatus };
  if (newStatus === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("work_orders")
    .update(updateData)
    .eq("id", workOrderId);

  if (error) {
    console.error("Error updating work order status:", error);
    return { error: error.message };
  }

  revalidatePath("/work-orders");
  revalidatePath("/dashboard");
  await logAudit("UPDATE_WORK_ORDER_STATUS", "work_order", workOrderId, { newStatus });
  return { success: true };
}

export async function assignWorkOrder(workOrderId: string, assignedToName: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("work_orders")
    .update({ assigned_to_name: assignedToName })
    .eq("id", workOrderId);

  if (error) {
    console.error("Error assigning work order:", error);
    return { error: error.message };
  }

  revalidatePath("/work-orders");
  return { success: true };
}

export async function updateWorkOrderNotes(workOrderId: string, notes: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("work_orders")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", workOrderId);

  if (error) {
    console.error("Error updating work order notes:", error);
    return { error: error.message };
  }

  revalidatePath("/work-orders");
  return { success: true };
}

export async function cancelWorkOrder(workOrderId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("work_orders")
    .update({ status: "cancelled" })
    .eq("id", workOrderId);

  if (error) {
    console.error("Error cancelling work order:", error);
    return { error: error.message };
  }

  revalidatePath("/work-orders");
  revalidatePath("/dashboard");
  return { success: true };
}
