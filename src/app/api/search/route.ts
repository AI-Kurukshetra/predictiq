import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ equipment: [], alerts: [], workOrders: [] });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pattern = `%${q}%`;

  const [equipmentResult, alertsResult, workOrdersResult] = await Promise.all([
    supabase
      .from("equipment")
      .select("id, name, type, health_score, status")
      .or(`name.ilike.${pattern},type.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("alerts")
      .select("id, title, message, severity, equipment_id")
      .or(`title.ilike.${pattern},message.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("work_orders")
      .select("id, title, status, equipment_id")
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .limit(5),
  ]);

  return NextResponse.json({
    equipment: equipmentResult.data ?? [],
    alerts: alertsResult.data ?? [],
    workOrders: workOrdersResult.data ?? [],
  });
}
