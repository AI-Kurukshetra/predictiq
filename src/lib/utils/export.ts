function formatValue(value: unknown): string {
  if (value == null) return "";

  // Format date strings (ISO timestamps) to YYYY-MM-DD for Excel compatibility
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}(T|\s)/.test(value)) {
    return value.slice(0, 10);
  }

  // If value is an object with a "name" property (e.g., facility join), extract name
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: string }).name);
  }

  return String(value);
}

function escapeCSV(str: string): string {
  // Always quote every field to avoid issues with commas, newlines, etc.
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns: { key: string; label: string }[]
) {
  const header = columns.map((c) => escapeCSV(c.label)).join(",");

  const rows = data.map((row) =>
    columns
      .map((col) => {
        let value = col.key.split(".").reduce<unknown>((obj, key) => {
          if (obj && typeof obj === "object") {
            const o = obj as Record<string, unknown>;
            if (Array.isArray(o[key])) return (o[key] as Record<string, unknown>[])[0];
            return o[key];
          }
          return undefined;
        }, row);

        return escapeCSV(formatValue(value));
      })
      .join(",")
  );

  const BOM = "\uFEFF";
  const csv = BOM + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPrintPDF() {
  window.print();
}
