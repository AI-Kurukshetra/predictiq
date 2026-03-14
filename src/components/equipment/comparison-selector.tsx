"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
}

const statusVariant = (s: string) => {
  if (s === "healthy") return "healthy" as const;
  if (s === "warning") return "warning" as const;
  if (s === "critical") return "critical" as const;
  return "default" as const;
};

export function ComparisonSelector({
  equipment,
  selectedIds,
}: {
  equipment: Equipment[];
  selectedIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const router = useRouter();

  const addEquipment = (id: string) => {
    if (selected.length >= 3 || selected.includes(id)) return;
    setSelected([...selected, id]);
  };

  const removeEquipment = (id: string) => {
    setSelected(selected.filter((s) => s !== id));
  };

  const compare = () => {
    if (selected.length < 2) return;
    router.push(`/equipment/compare?ids=${selected.join(",")}`);
  };

  const selectedEquipment = selected
    .map((id) => equipment.find((e) => e.id === id))
    .filter(Boolean) as Equipment[];

  return (
    <div className="space-y-4 rounded-xl border border-[#E8ECF1] bg-white p-6">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[#1A2332]">
            Select Equipment (2-3)
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) addEquipment(e.target.value);
              e.target.value = "";
            }}
            disabled={selected.length >= 3}
            className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] disabled:opacity-50"
          >
            <option value="">Choose equipment...</option>
            {equipment
              .filter((e) => !selected.includes(e.id))
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.type}) — {e.status}
                </option>
              ))}
          </select>
        </div>
        <button
          type="button"
          onClick={compare}
          disabled={selected.length < 2}
          className="rounded-lg bg-[#3B82F6] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#166534] disabled:opacity-50"
        >
          Compare
        </button>
      </div>

      {selectedEquipment.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedEquipment.map((eq) => (
            <span
              key={eq.id}
              className="inline-flex items-center gap-2 rounded-full border border-[#E8ECF1] bg-[#F5F6FA] px-3 py-1 text-sm"
            >
              {eq.name}
              <Badge variant={statusVariant(eq.status)} className="text-[10px]">
                {eq.status}
              </Badge>
              <button type="button" onClick={() => removeEquipment(eq.id)}>
                <X className="h-3.5 w-3.5 text-[#5A6578] hover:text-[#1A2332]" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
