"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { updateWorkOrderStatus, cancelWorkOrder } from "@/lib/actions/work-orders";

export function WorkOrderActions({
  workOrderId,
  status,
  completedAt,
}: {
  workOrderId: string;
  status: string;
  completedAt?: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "completed") {
    return (
      <span className="text-xs text-[#0B2340]">
        {completedAt
          ? format(new Date(completedAt), "MMM dd, yyyy")
          : "Completed"}
      </span>
    );
  }

  if (status === "cancelled") {
    return <span className="text-xs text-[#8C95A6]">Cancelled</span>;
  }

  if (status === "open") {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateWorkOrderStatus(workOrderId, "in_progress");
            })
          }
          className="rounded-lg bg-[#DBEAFE] px-3 py-1.5 text-xs font-medium text-[#1E40AF] transition hover:bg-[#DBEAFE] disabled:opacity-50"
        >
          {isPending ? "..." : "Start"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await cancelWorkOrder(workOrderId);
            })
          }
          className="rounded-lg bg-[#F5F6FA] px-3 py-1.5 text-xs font-medium text-[#5A6578] transition hover:bg-[#E8ECF1] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (status === "in_progress") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await updateWorkOrderStatus(workOrderId, "completed");
          })
        }
        className="rounded-lg bg-[#DCFCE7] px-3 py-1.5 text-xs font-medium text-[#0B2340] transition hover:bg-[#DCFCE7] disabled:opacity-50"
      >
        {isPending ? "..." : "Complete"}
      </button>
    );
  }

  return null;
}
