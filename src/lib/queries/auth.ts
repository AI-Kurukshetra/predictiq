import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, facility_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return profile;
}

export async function getCurrentRole() {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

export async function isAdmin() {
  const role = await getCurrentRole();
  return role === "admin";
}

export async function isManager() {
  const role = await getCurrentRole();
  return role === "manager";
}
