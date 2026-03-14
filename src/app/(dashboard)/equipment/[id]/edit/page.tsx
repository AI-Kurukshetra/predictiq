import { redirect, notFound } from "next/navigation";
import { getCurrentRole } from "@/lib/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { EquipmentForm } from "@/components/equipment/equipment-form";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getCurrentRole();
  if (role !== "admin") redirect("/equipment");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: equipment }, { data: facilities }] = await Promise.all([
    supabase.from("equipment").select("*").eq("id", id).single(),
    supabase.from("facilities").select("id, name").order("name"),
  ]);

  if (!equipment) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#1A2332]">Edit Equipment</h1>
        <p className="mt-1 text-sm text-[#5A6578]">Update equipment details</p>
      </header>
      <EquipmentForm facilities={facilities ?? []} equipment={equipment} />
    </div>
  );
}
