"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/lib/actions/users";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#6B1D3A]">Are you sure?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteUser(userId);
              setConfirming(false);
            })
          }
          className="rounded px-2 py-1 text-xs font-medium text-white bg-[#8B2252] hover:bg-[#6B1D3A] disabled:opacity-50"
        >
          {isPending ? "..." : "Yes"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-1 text-xs font-medium text-[#5A6578] hover:bg-[#F5F6FA]"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded p-1 text-[#8B2252] hover:bg-[#F0E4E8]"
      title="Delete user"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
