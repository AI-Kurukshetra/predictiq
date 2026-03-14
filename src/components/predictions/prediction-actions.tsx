"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  resolvePrediction,
  dismissPrediction,
  createWorkOrderFromPrediction,
} from "@/lib/actions/predictions";

export function PredictionActions({ predictionId }: { predictionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [created, setCreated] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending || created}
        onClick={() =>
          startTransition(async () => {
            const result = await createWorkOrderFromPrediction(predictionId);
            if (result?.success) {
              setCreated(true);
            }
          })
        }
        className={
          created
            ? "rounded-lg px-4 py-2 text-sm font-medium text-[#0D8070]"
            : "rounded-lg bg-[#E07A5F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#C4654D] disabled:opacity-50"
        }
      >
        {created
          ? "Work Order Created"
          : isPending
            ? "Creating..."
            : "Create Work Order"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await resolvePrediction(predictionId);
            router.refresh();
          })
        }
        className="rounded-lg border border-[#0D8070] px-4 py-2 text-sm font-medium text-[#0D8070] transition hover:bg-[#E6F5F0] disabled:opacity-50"
      >
        Mark Resolved
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await dismissPrediction(predictionId);
            router.refresh();
          })
        }
        className="px-4 py-2 text-sm font-medium text-[#5A6578] transition hover:text-[#1A2332] disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
