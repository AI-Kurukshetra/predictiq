import { createClient } from "@/lib/supabase/server";

export async function getAllUsers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, facility_id, created_at, updated_at, facilities(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data ?? [];
}

export async function getTechnicians() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("role", "technician")
    .order("full_name");

  if (error) {
    console.error("Error fetching technicians:", error);
    return [];
  }

  return (data ?? []).filter((t) => t.full_name);
}

export async function getUserStats() {
  const supabase = await createClient();

  const [totalResult, managerResult, technicianResult, adminResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "manager"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "technician"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
  ]);

  if (totalResult.error) {
    console.error("Error fetching user stats:", totalResult.error);
  }

  return {
    total: totalResult.count ?? 0,
    managers: managerResult.count ?? 0,
    technicians: technicianResult.count ?? 0,
    admins: adminResult.count ?? 0,
  };
}
