import Link from "next/link";
import { Filter, GitCompareArrows, Plus, Search, Wrench } from "lucide-react";
import { getEquipmentList, getEquipmentStats } from "@/lib/queries/equipment";
import { getCurrentRole } from "@/lib/queries/auth";
import EquipmentCard from "@/components/equipment/equipment-card";
import Badge from "@/components/ui/badge";
import { ExportButton } from "@/components/ui/export-button";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ facility?: string }>;
}) {
  const params = await searchParams;
  const facilityId = params.facility;

  try {
  const [equipment, stats, role] = await Promise.all([getEquipmentList(facilityId), getEquipmentStats(), getCurrentRole()]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Equipment</h1>
          <p className="mt-1 text-sm text-[#5A6578]">
            Monitor and manage all connected equipment
          </p>
        </div>

        <div className="flex items-center gap-2 text-[#5A6578]">
          <ExportButton
            data={equipment as unknown as Record<string, unknown>[]}
            filename={`predictiq-equipment-${new Date().toISOString().slice(0, 10)}.csv`}
            columns={[
              { key: "name", label: "Name" },
              { key: "type", label: "Type" },
              { key: "health_score", label: "Health Score" },
              { key: "status", label: "Status" },
              { key: "location_zone", label: "Zone" },
              { key: "last_maintenance", label: "Last Maintenance" },
            ]}
          />
          <Link
            href="/equipment/compare"
            className="inline-flex items-center gap-2 rounded-lg border border-[#0B2340] bg-white px-3 py-2 text-sm font-medium text-[#0B2340] hover:bg-[#F5F6FA]"
          >
            <GitCompareArrows className="h-4 w-4" />
            Compare
          </Link>
          {role === "admin" && (
            <Link
              href="/equipment/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-3 py-2 text-sm font-medium text-white hover:bg-[#C4654D]"
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </Link>
          )}
        </div>
      </header>

      <section className="flex flex-wrap gap-3">
        <Badge className="rounded-full bg-[#F5F6FA] px-3 py-1 text-sm text-[#1A2332]">
          All: {stats.total}
        </Badge>
        <Badge
          variant="healthy"
          className="rounded-full bg-[#E6F5F0] px-3 py-1 text-sm text-[#0B2340]"
        >
          Healthy: {stats.healthy}
        </Badge>
        <Badge
          variant="warning"
          className="rounded-full bg-[#FFF0EB] px-3 py-1 text-sm text-[#0A6B5E]"
        >
          Warning: {stats.warning}
        </Badge>
        <Badge
          variant="critical"
          className="rounded-full bg-[#F0E4E8] px-3 py-1 text-sm text-[#6B1D3A]"
        >
          Critical: {stats.critical}
        </Badge>
      </section>

      {equipment.length === 0 ? (
        <section className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E8ECF1] bg-white p-8 text-center">
          <Wrench className="h-8 w-8 text-[#8C95A6]" />
          <p className="mt-3 text-base font-medium text-[#1A2332]">No equipment found</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </section>
      )}
    </div>
  );

  } catch (error) {
    console.error('Equipment error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load equipment</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}
