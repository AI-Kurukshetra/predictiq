import { redirect } from "next/navigation";
import { getCurrentRole } from "@/lib/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { EquipmentForm } from "@/components/equipment/equipment-form";

export default async function NewEquipmentPage() {
  const role = await getCurrentRole();
  if (role !== "admin") redirect("/equipment");

  const supabase = await createClient();
  const { data: facilities } = await supabase.from("facilities").select("id, name").order("name");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#1A2332]">Add Equipment</h1>
        <p className="mt-1 text-sm text-[#5A6578]">Register new equipment in the system</p>
      </header>
      <EquipmentForm facilities={facilities ?? []} />
    </div>
  );
}
