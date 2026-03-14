import { redirect } from "next/navigation";
import { GitCompareArrows } from "lucide-react";
import { getCurrentRole } from "@/lib/queries/auth";
import { getEquipmentList } from "@/lib/queries/equipment";
import { getEquipmentForComparison } from "@/lib/queries/comparison";
import { ComparisonSelector } from "@/components/equipment/comparison-selector";
import { ComparisonCharts } from "@/components/equipment/comparison-charts";

export default async function EquipmentComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const role = await getCurrentRole();
  if (role === "technician") redirect("/dashboard");

  const params = await searchParams;
  const selectedIds = params.ids ? params.ids.split(",").filter(Boolean) : [];

  try {
  const equipmentList = await getEquipmentList();
  const equipment = equipmentList.map((eq) => ({
    id: eq.id,
    name: eq.name,
    type: eq.type,
    status: eq.status,
  }));

  const comparisonData =
    selectedIds.length >= 2
      ? await getEquipmentForComparison(selectedIds)
      : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#1A2332]">Equipment Comparison</h1>
        <p className="mt-1 text-sm text-[#5A6578]">
          Compare performance across equipment
        </p>
      </header>

      <ComparisonSelector equipment={equipment} selectedIds={selectedIds} />

      {comparisonData.length >= 2 ? (
        <ComparisonCharts equipmentList={comparisonData as never[]} />
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E8ECF1] bg-white p-8 text-center">
          <GitCompareArrows className="h-8 w-8 text-[#8C95A6]" />
          <p className="mt-3 text-base font-medium text-[#1A2332]">
            Select 2-3 equipment above to compare
          </p>
        </div>
      )}
    </div>
  );

  } catch (error) {
    console.error('Equipment comparison error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load equipment comparison</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}
