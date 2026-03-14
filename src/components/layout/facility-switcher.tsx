"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MapPin } from "lucide-react";

interface Facility {
  id: string;
  name: string;
}

export function FacilitySwitcher({ facilities }: { facilities: Facility[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentFacility = searchParams.get("facility") ?? "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("facility", value);
    } else {
      params.delete("facility");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      <MapPin className="h-4 w-4 text-[#5A6578]" />
      <select
        value={currentFacility}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-[#E8ECF1] px-3 py-1.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
      >
        <option value="">All Facilities</option>
        {facilities.map((f) => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
    </div>
  );
}
