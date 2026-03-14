"use client";

import { useState, useEffect } from "react";

export function AiHealthSummary({ equipmentId }: { equipmentId: string }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Give a one-sentence health summary for this equipment. Be specific about any issues.",
            equipmentId,
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
  }, [equipmentId]);

  if (loading) {
    return <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#E8ECF1]" />;
  }

  if (!summary) return null;

  return (
    <p className="mt-2 text-sm italic text-[#5A6578]">{summary}</p>
  );
}
