"use server";

import { createClient as createServerClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const VALID_ROLES = ["manager", "technician", "admin"];

export async function updateUserRole(userId: string, newRole: string) {
  if (!VALID_ROLES.includes(newRole)) {
    return { error: "Invalid role" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return { error: error.message };
  }

  revalidatePath("/users");
  await logAudit("CHANGE_USER_ROLE", "user", userId, { newRole });
  return { success: true };
}

export async function updateUserFacility(userId: string, facilityId: string | null) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ facility_id: facilityId })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user facility:", error);
    return { error: error.message };
  }

  revalidatePath("/users");
  return { success: true };
}

export async function inviteUser(formData: FormData) {
  const email = formData.get("email") as string;
  const full_name = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const facility_id = formData.get("facility_id") as string | null;

  if (!email || !full_name || !role) {
    return { error: "Email, name, and role are required" };
  }

  if (!VALID_ROLES.includes(role)) {
    return { error: "Invalid role" };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TempPass123!",
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (error) {
    console.error("Error creating user:", error);
    return { error: error.message };
  }

  if (facility_id && data.user) {
    await admin
      .from("profiles")
      .update({ facility_id })
      .eq("id", data.user.id);
  }

  revalidatePath("/users");
  await logAudit("INVITE_USER", "user", undefined, { email });
  return { success: true };
}

export async function deleteUser(userId: string) {
  if (!userId) {
    return { error: "User ID is required" };
  }

  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("Error deleting profile:", profileError);
    return { error: profileError.message };
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Error deleting auth user:", authError);
    return { error: authError.message };
  }

  revalidatePath("/users");
  await logAudit("DELETE_USER", "user", userId);
  return { success: true };
}
