"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Wrench, Bell, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchResults {
  equipment: { id: string; name: string; type: string; health_score: number; status: string }[];
  alerts: { id: string; title: string; severity: string; equipment_id: string }[];
  workOrders: { id: string; title: string; status: string }[];
}

const statusVariant = (s: string) => {
  if (s === "healthy") return "healthy" as const;
  if (s === "warning") return "warning" as const;
  if (s === "critical") return "critical" as const;
  return "default" as const;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(value), 300);
  };

  const navigate = (path: string) => {
    setOpen(false);
    setQuery("");
    router.push(path);
  };

  const hasResults =
    results &&
    (results.equipment.length > 0 || results.alerts.length > 0 || results.workOrders.length > 0);

  return (
    <div ref={ref} className="relative">
      <div className="flex w-72 items-center gap-2 rounded-lg border border-[#E8ECF1] bg-white px-3 py-1.5">
        <Search className="h-4 w-4 text-[#8C95A6]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search equipment, alerts..."
          className="flex-1 bg-transparent text-sm text-[#1A2332] outline-none placeholder:text-[#8C95A6]"
        />
        <kbd className="hidden rounded bg-[#F5F6FA] px-1.5 py-0.5 text-[10px] text-[#8C95A6] sm:inline">
          ⌘K
        </kbd>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-[#E8ECF1] bg-white shadow-xl">
          <div className="max-h-80 overflow-y-auto">
            {!hasResults ? (
              <p className="px-4 py-6 text-center text-sm text-[#5A6578]">
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <>
                {results.equipment.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-xs font-medium uppercase text-[#8C95A6]">Equipment</p>
                    {results.equipment.map((eq) => (
                      <button key={eq.id} type="button" onClick={() => navigate(`/equipment/${eq.id}`)} className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#F9FAFB]">
                        <Wrench className="h-4 w-4 text-[#5A6578]" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1A2332]">{eq.name}</p>
                          <p className="text-xs text-[#5A6578]">{eq.type}</p>
                        </div>
                        <Badge variant={statusVariant(eq.status)}>{eq.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}
                {results.alerts.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-xs font-medium uppercase text-[#8C95A6]">Alerts</p>
                    {results.alerts.map((alert) => (
                      <button key={alert.id} type="button" onClick={() => navigate("/alerts")} className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#F9FAFB]">
                        <Bell className="h-4 w-4 text-[#5A6578]" />
                        <p className="flex-1 text-sm text-[#1A2332]">{alert.title}</p>
                        <Badge variant={alert.severity === "critical" ? "critical" : "warning"}>{alert.severity}</Badge>
                      </button>
                    ))}
                  </div>
                )}
                {results.workOrders.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-xs font-medium uppercase text-[#8C95A6]">Work Orders</p>
                    {results.workOrders.map((wo) => (
                      <button key={wo.id} type="button" onClick={() => navigate("/work-orders")} className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#F9FAFB]">
                        <ClipboardList className="h-4 w-4 text-[#5A6578]" />
                        <p className="flex-1 text-sm text-[#1A2332]">{wo.title}</p>
                        <Badge variant="default">{wo.status.replace("_", " ")}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
