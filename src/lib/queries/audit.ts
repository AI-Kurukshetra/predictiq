import { createClient } from "@/lib/supabase/server";

export async function getAuditLogs(filters?: {
  action?: string;
  userId?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 100);

  if (filters?.action) {
    query = query.eq("action", filters.action);
  }

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const { data, error } = await query;

  if (error) {
    // Table may not exist yet — run scripts/004_audit_logs.sql in Supabase SQL Editor
    return [];
  }

  return data ?? [];
}
