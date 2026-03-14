"use client";

import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/utils/export";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns: { key: string; label: string }[];
}

export function ExportButton({ data, filename, columns }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => exportToCSV(data, filename, columns)}
      className="inline-flex items-center gap-2 rounded-lg border border-[#E8ECF1] bg-white px-3 py-2 text-sm font-medium text-[#1A2332] transition hover:bg-[#F9FAFB]"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
