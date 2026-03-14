"use client";

import { useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { acknowledgeAlert, resolveAlert } from "@/lib/actions/alerts";

export function AlertActionButtons({
  alertId,
  status,
}: {
  alertId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "resolved") {
    return <CheckCircle className="h-4 w-4 text-[#0B2340]" />;
  }

  if (status === "new") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => { await acknowledgeAlert(alertId); })}
        className="rounded-lg bg-[#DBEAFE] px-3 py-1.5 text-xs font-medium text-[#1E40AF] transition hover:bg-[#DBEAFE] disabled:opacity-50"
      >
        {isPending ? "..." : "Acknowledge"}
      </button>
    );
  }

  if (status === "acknowledged") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => { await resolveAlert(alertId); })}
        className="rounded-lg bg-[#E6F5F0] px-3 py-1.5 text-xs font-medium text-[#0B2340] transition hover:bg-[#D4EDDA] disabled:opacity-50"
      >
        {isPending ? "..." : "Resolve"}
      </button>
    );
  }

  return null;
}
