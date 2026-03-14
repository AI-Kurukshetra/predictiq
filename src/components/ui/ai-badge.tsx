import { Sparkles } from "lucide-react";

export function AiBadge({ label = "AI" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#E07A5F] px-2 py-0.5 text-[10px] font-medium text-white">
      <Sparkles className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
