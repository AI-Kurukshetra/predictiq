import { createClient } from "@/lib/supabase/server";

export async function getUnreadAlertCount() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  if (error) {
    console.error("Error fetching unread alert count:", error);
    return 0;
  }

  return count ?? 0;
}

export async function getRecentNotifications(limit: number = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("alerts")
    .select("*, equipment(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent notifications:", error);
    return [];
  }

  return data ?? [];
}
