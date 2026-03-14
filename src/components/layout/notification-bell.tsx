"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { markAllAlertsRead } from "@/lib/actions/notifications";

interface Notification {
  id: string;
  severity: string;
  message: string;
  created_at: string;
  equipment: { name: string } | { name: string }[] | null;
}

const severityColor: Record<string, string> = {
  critical: "bg-[#F53642]",
  major: "bg-[#F59E0B]",
  minor: "bg-[#F59E0B]",
  info: "bg-[#3B82F6]",
};

export function NotificationBell({
  initialCount,
  initialNotifications,
}: {
  initialCount: number;
  initialNotifications: Notification[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getEquipmentName = (eq: Notification["equipment"]) => {
    if (!eq) return "Unknown";
    if (Array.isArray(eq)) return eq[0]?.name ?? "Unknown";
    return eq.name;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-1.5 text-[#5A6578] transition hover:bg-[#F9FAFB]"
      >
        <Bell className="h-5 w-5" />
        {initialCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F53642] text-[10px] font-bold text-white">
            {initialCount > 9 ? "9+" : initialCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-[#E8ECF1] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#E8ECF1] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#1A2332]">Notifications</h3>
            {initialCount > 0 && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await markAllAlertsRead();
                    setOpen(false);
                  });
                }}
                className="text-xs font-medium text-[#3B82F6] hover:underline disabled:opacity-50"
              >
                {isPending ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {initialNotifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#5A6578]">No notifications</p>
            ) : (
              initialNotifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/alerts");
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#F9FAFB]"
                >
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${severityColor[n.severity] ?? "bg-[#8C95A6]"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1A2332]">{getEquipmentName(n.equipment)}</p>
                    <p className="truncate text-xs text-[#5A6578]">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-[#8C95A6]">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-[#E8ECF1] px-4 py-2">
            <button
              type="button"
              onClick={() => { setOpen(false); router.push("/alerts"); }}
              className="w-full text-center text-xs font-medium text-[#3B82F6] hover:underline"
            >
              View all alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
