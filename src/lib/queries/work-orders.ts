import { createClient } from "@/lib/supabase/server";

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export async function getWorkOrders(filters?: { status?: string; priority?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("work_orders")
    .select("*, equipment(name), predictions(failure_type)")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }

  const workOrders = data ?? [];

  // Sort by priority (urgent first)
  workOrders.sort((a, b) => {
    const aPriority = PRIORITY_ORDER[a.priority] ?? Number.MAX_SAFE_INTEGER;
    const bPriority = PRIORITY_ORDER[b.priority] ?? Number.MAX_SAFE_INTEGER;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return workOrders;
}

export async function getWorkOrderStats() {
  const supabase = await createClient();

  const [totalResult, openResult, inProgressResult, completedResult, cancelledResult, urgentResult, highResult, mediumResult, lowResult] =
    await Promise.all([
      supabase.from("work_orders").select("*", { count: "exact", head: true }),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("priority", "urgent"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("priority", "high"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("priority", "medium"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("priority", "low"),
    ]);

  if (totalResult.error) {
    console.error("Error fetching work order stats:", totalResult.error);
  }

  return {
    total: totalResult.count ?? 0,
    open: openResult.count ?? 0,
    in_progress: inProgressResult.count ?? 0,
    completed: completedResult.count ?? 0,
    cancelled: cancelledResult.count ?? 0,
    byPriority: {
      urgent: urgentResult.count ?? 0,
      high: highResult.count ?? 0,
      medium: mediumResult.count ?? 0,
      low: lowResult.count ?? 0,
    },
  };
}

export async function getWorkOrderById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("work_orders")
    .select("*, equipment(name, type, health_score), predictions(failure_type, confidence, contributing_factors)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching work order by id:", error);
    return null;
  }

  return data;
}
