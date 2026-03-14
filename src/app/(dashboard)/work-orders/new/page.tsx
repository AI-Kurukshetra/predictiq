import { getEquipmentList } from "@/lib/queries/equipment";
import { getTechnicians } from "@/lib/queries/users";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";

export default async function NewWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ equipment?: string }>;
}) {
  const params = await searchParams;

  try {
  const [equipmentList, technicians] = await Promise.all([
    getEquipmentList(),
    getTechnicians(),
  ]);

  const equipment = equipmentList.map((eq) => ({
    id: eq.id,
    name: eq.name,
    status: eq.status,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#1A2332]">New Work Order</h1>
        <p className="mt-1 text-sm text-[#5A6578]">
          Create a new maintenance work order
        </p>
      </header>

      <WorkOrderForm
        equipment={equipment}
        defaultEquipmentId={params.equipment}
        technicians={technicians}
      />
    </div>
  );

  } catch (error) {
    console.error('New work order error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load page</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}
