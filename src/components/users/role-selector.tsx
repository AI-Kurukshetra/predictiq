"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/lib/actions/users";

const roleBorderColor: Record<string, string> = {
  manager: "border-[#0D8070]",
  technician: "border-[#3B82F6]",
  admin: "border-[#E07A5F]",
};

export function RoleSelector({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      key={currentRole}
      disabled={isPending}
      defaultValue={currentRole}
      onChange={(e) => {
        startTransition(async () => {
          await updateUserRole(userId, e.target.value);
        });
      }}
      className={`rounded-lg border-2 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D8070] disabled:opacity-50 ${roleBorderColor[currentRole] ?? "border-[#E8ECF1]"}`}
    >
      <option value="manager">Manager</option>
      <option value="technician">Technician</option>
      <option value="admin">Admin</option>
    </select>
  );
}
