"use client";

import { useState } from "react";
import { Sparkles, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnomalyResult {
  summary: string;
  deviation: string;
  possibleCauses: string[];
  riskLevel: string;
  immediateAction: string;
}

const riskVariant = (level: string) => {
  const l = level.toLowerCase();
  if (l === "critical") return "critical" as const;
  if (l === "high") return "warning" as const;
  if (l === "medium") return "default" as const;
  return "info" as const;
};

export function AnomalyExplainer({
  sensorId,
  equipmentId,
  sensorType,
  anomalyCount,
}: {
  sensorId: string;
  equipmentId: string;
  sensorType: string;
  anomalyCount: number;
}) {
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  if (anomalyCount === 0) return null;

  const analyze = async () => {
    setLoading(true);
    setVisible(true);
    try {
      const res = await fetch("/api/ai/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensorId, equipmentId }),
      });
      const data = await res.json();
      if (!data.error) setResult(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {!visible && (
        <button
          type="button"
          onClick={analyze}
          className="inline-flex items-center gap-1.5 text-sm text-[#3B82F6] hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Explain {anomalyCount} anomal{anomalyCount === 1 ? "y" : "ies"}
        </button>
      )}

      {visible && (
        <div className="mt-2 rounded-xl border border-[#3B82F6]/30 bg-[#F5F6FA] p-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#E8ECF1]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#E8ECF1]" />
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3B82F6]" />
                <span className="text-xs font-medium text-[#3B82F6]">AI Anomaly Analysis</span>
              </div>
              <p className="text-sm font-semibold text-[#1A2332]">{result.summary}</p>
              <p className="text-xs text-[#5A6578]">Deviation: {result.deviation}</p>
              <div>
                <p className="text-xs font-medium text-[#5A6578]">Possible causes:</p>
                <ol className="ml-4 list-decimal text-xs text-[#1A2332]">
                  {result.possibleCauses.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ol>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5A6578]">Risk:</span>
                <Badge variant={riskVariant(result.riskLevel)}>{result.riskLevel}</Badge>
              </div>
              <p className="flex items-start gap-1.5 text-xs text-[#5A6578]">
                <Wrench className="mt-0.5 h-3 w-3 shrink-0" />
                {result.immediateAction}
              </p>
              <button type="button" onClick={() => setVisible(false)} className="text-xs text-[#8C95A6] hover:underline">
                Dismiss
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#5A6578]">Unable to analyze. <button type="button" onClick={analyze} className="text-[#3B82F6] hover:underline">Retry</button></p>
          )}
        </div>
      )}
    </div>
  );
}
