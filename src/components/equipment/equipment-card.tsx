import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HealthScore } from "@/components/equipment/health-score";

type Equipment = {
  id: string;
  name: string;
  type: string;
  health_score: number;
  status: string;
  location_zone: string;
  last_maintenance: string;
  facilities?: { name: string } | { name: string }[];
};

const statusVariant = (status: string) => {
  switch (status) {
    case "healthy":
      return "healthy" as const;
    case "warning":
      return "warning" as const;
    case "critical":
      return "critical" as const;
    default:
      return "default" as const;
  }
};

function getFacilityName(facilities?: Equipment["facilities"]) {
  if (!facilities) return null;
  if (Array.isArray(facilities)) return facilities[0]?.name ?? null;
  return facilities.name;
}

export function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const facilityName = getFacilityName(equipment.facilities);
  return (
    <Link href={`/equipment/${equipment.id}`}>
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-4 transition hover:shadow-lg cursor-pointer">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-[#1A2332]">
            {equipment.name}
          </h3>
          <Badge variant={statusVariant(equipment.status)}>
            {equipment.status}
          </Badge>
        </div>

        {/* Second row */}
        <p className="mt-1 text-sm text-[#5A6578]">
          {equipment.type} · {equipment.location_zone}
        </p>

        {/* Bottom section */}
        <div className="mt-3 flex items-center gap-3">
          <HealthScore score={equipment.health_score} size="md" />
          <div className="min-w-0 text-xs text-[#5A6578]">
            <p>
              Last maintenance:{" "}
              {formatDistanceToNow(new Date(equipment.last_maintenance), {
                addSuffix: true,
              })}
            </p>
            {facilityName && (
              <p className="mt-0.5 truncate">{facilityName}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default EquipmentCard;
