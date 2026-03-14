"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg border border-[#E8ECF1] bg-white px-3 py-2 text-sm font-medium text-[#1A2332] transition hover:bg-[#F5F6FA] no-print"
    >
      <Printer className="h-4 w-4" />
      Print Report
    </button>
  );
}
