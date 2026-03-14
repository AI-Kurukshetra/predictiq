"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Recommendation {
  equipment: string;
  action: string;
  priority: string;
  scheduleBefore: string;
  estimatedDuration: string;
  estimatedCost: string;
  reason: string;
}

const priorityBorder: Record<string, string> = {
  urgent: "border-l-[#8B2252]",
  high: "border-l-[#E07A5F]",
  medium: "border-l-[#3B82F6]",
  low: "border-l-[#0D8070]",
};

const priorityVariant = (p: string) => {
  if (p === "urgent") return "critical" as const;
  if (p === "high") return "warning" as const;
  if (p === "low") return "info" as const;
  return "default" as const;
};

export function AiMaintenancePlan({ facilityId }: { facilityId?: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [timestamp, setTimestamp] = useState<string>("");

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/maintenance-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId }),
      });
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
      setGenerated(true);
      setTimestamp(new Date().toLocaleTimeString());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E8ECF1] bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#E07A5F]" />
          <h3 className="text-lg font-semibold text-[#1A2332]">AI Maintenance Recommendations</h3>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-[#0D8070] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#C4654D] disabled:opacity-50"
        >
          {loading ? "Generating..." : generated ? "Regenerate" : "Generate Plan"}
        </button>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : !generated ? (
        <p className="mt-4 text-sm text-[#5A6578]">
          Click &ldquo;Generate Plan&rdquo; to get AI-powered maintenance recommendations based on current equipment health and predictions.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`rounded-lg border-l-4 border border-[#E8ECF1] p-4 ${priorityBorder[rec.priority] ?? "border-l-[#8C95A6]"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1A2332]">{rec.equipment}</span>
                <Badge variant={priorityVariant(rec.priority)}>{rec.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-[#1A2332]">{rec.action}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5A6578]">
                <span>Schedule: {rec.scheduleBefore}</span>
                <span>Duration: {rec.estimatedDuration}</span>
                <span>Cost: {rec.estimatedCost}</span>
              </div>
              <p className="mt-1 text-xs italic text-[#5A6578]">{rec.reason}</p>
              <Link
                href="/work-orders/new"
                className="mt-2 inline-block text-xs font-medium text-[#0D8070] hover:underline"
              >
                Create Work Order →
              </Link>
            </div>
          ))}

          {timestamp && (
            <p className="text-xs text-[#8C95A6]">Last generated: {timestamp}</p>
          )}
        </div>
      )}
    </div>
  );
}
