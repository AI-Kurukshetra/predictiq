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
        <span className="text-xs text-[#991B1B]">Are you sure?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteUser(userId);
              setConfirming(false);
            })
          }
          className="rounded px-2 py-1 text-xs font-medium text-white bg-[#F53642] hover:bg-[#991B1B] disabled:opacity-50"
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
      className="rounded p-1 text-[#F53642] hover:bg-[#FEE2E2]"
      title="Delete user"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
