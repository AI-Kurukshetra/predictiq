"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { InviteUserModal } from "./invite-user-modal";

interface Facility {
  id: string;
  name: string;
}

export function AddUserButton({ facilities }: { facilities: Facility[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#C4654D]"
      >
        <UserPlus className="h-4 w-4" />
        Add User
      </button>
      {open && (
        <InviteUserModal
          facilities={facilities}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
