"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RootCauseResult {
  primaryCause: string;
  secondaryCauses: string[];
  evidence: string[];
  timeline: string;
  preventionSteps: string[];
  estimatedUrgency: string;
}

export function RootCauseAnalysis({ predictionId }: { predictionId: string }) {
  const [result, setResult] = useState<RootCauseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setVisible(true);
    try {
      const res = await fetch("/api/ai/root-cause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId }),
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
    <div>
      {!visible && (
        <button
          type="button"
          onClick={analyze}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E07A5F] px-3 py-1.5 text-xs font-medium text-[#0D8070] transition hover:bg-[#FFF8F5]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Root Cause Analysis
        </button>
      )}

      {visible && (
        <div className="mt-3 rounded-xl border border-[#E07A5F]/20 bg-[#FFF8F5] p-5">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#E8ECF1]" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-[#E8ECF1]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#E8ECF1]" />
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1A2332]">Root Cause Analysis</span>
                <span className="rounded-full bg-gradient-to-r from-[#E07A5F] to-[#0A6B5E] px-2 py-0.5 text-[10px] font-medium text-white">
                  AI Generated
                </span>
              </div>

              <div className="border-l-4 border-[#E07A5F] bg-white p-3 rounded">
                <p className="text-sm font-semibold text-[#1A2332]">{result.primaryCause}</p>
              </div>

              {result.secondaryCauses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#5A6578]">Secondary causes:</p>
                  <ul className="ml-4 list-disc text-xs text-[#1A2332]">
                    {result.secondaryCauses.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {result.evidence.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#5A6578]">Evidence:</p>
                  {result.evidence.map((e, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-[#1A2332]">
                      <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-[#0D8070]" />
                      {e}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs italic text-[#5A6578]">{result.timeline}</p>

              {result.preventionSteps.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#5A6578]">Prevention steps:</p>
                  <ol className="ml-4 list-decimal text-xs text-[#1A2332]">
                    {result.preventionSteps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5A6578]">Urgency:</span>
                <Badge variant="warning">{result.estimatedUrgency}</Badge>
              </div>

              <Link
                href="/work-orders/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E07A5F] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#C4654D]"
              >
                Create Work Order
              </Link>
            </div>
          ) : (
            <p className="text-sm text-[#5A6578]">Unable to analyze. <button type="button" onClick={analyze} className="text-[#E07A5F] hover:underline">Retry</button></p>
          )}
        </div>
      )}
    </div>
  );
}
