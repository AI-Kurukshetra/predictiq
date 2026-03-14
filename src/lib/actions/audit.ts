"use server";

import { createClient } from "@/lib/supabase/server";

export async function logAudit(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userName = "Unknown";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      userName = profile?.full_name ?? "Unknown";
    }

    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      user_name: userName,
      action,
      resource_type: resourceType,
      resource_id: resourceId ?? null,
      details: details ?? null,
    });
  } catch {
    // Audit logging should never break the main action
  }
}
