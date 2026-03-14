"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export function AiDashboardSummary() {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Summarize the current state of all equipment in 2 sentences. Highlight the most urgent issue.",
          }),
        });
        const data = await res.json();
        setSummary(data.response ?? "");
      } catch {
        setSummary("");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border-l-4 border-l-[#3B82F6] border border-[#E8ECF1] bg-white p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#E8ECF1]" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#E8ECF1]" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="rounded-xl border-l-4 border-l-[#3B82F6] border border-[#E8ECF1] bg-white p-4">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" />
        <p className="text-sm text-[#1A2332]">{summary}</p>
      </div>
    </div>
  );
}
