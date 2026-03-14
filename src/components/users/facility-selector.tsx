"use client";

import { useTransition } from "react";
import { updateUserFacility } from "@/lib/actions/users";

interface Facility {
  id: string;
  name: string;
}

export function FacilitySelector({
  userId,
  currentFacilityId,
  facilities,
}: {
  userId: string;
  currentFacilityId: string | null;
  facilities: Facility[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      key={currentFacilityId ?? "all"}
      disabled={isPending}
      defaultValue={currentFacilityId ?? ""}
      onChange={(e) => {
        const value = e.target.value || null;
        startTransition(async () => {
          await updateUserFacility(userId, value);
        });
      }}
      className="rounded-lg border border-[#E8ECF1] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] disabled:opacity-50"
    >
      <option value="">All Facilities</option>
      {facilities.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}
