import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getCurrentRole } from "@/lib/queries/auth";
import { getAuditLogs } from "@/lib/queries/audit";
import { Badge } from "@/components/ui/badge";

const ACTION_FILTERS = [
  { label: "All", value: "" },
  { label: "Acknowledge Alert", value: "ACKNOWLEDGE_ALERT" },
  { label: "Resolve Alert", value: "RESOLVE_ALERT" },
  { label: "Create Work Order", value: "CREATE_WORK_ORDER" },
  { label: "Update WO Status", value: "UPDATE_WORK_ORDER_STATUS" },
  { label: "Change Role", value: "CHANGE_USER_ROLE" },
  { label: "Prediction WO", value: "CREATE_WO_FROM_PREDICTION" },
];

const actionBadgeStyle = (action: string) => {
  if (action.includes("ALERT")) return "bg-[#DBEAFE] text-[#1E40AF]";
  if (action.includes("WORK_ORDER") || action.includes("WO_STATUS")) return "bg-[#E6F5F0] text-[#0B2340]";
  if (action.includes("USER") || action.includes("ROLE")) return "bg-[#FFF0EB] text-[#8B3A1F]";
  if (action.includes("PREDICTION")) return "bg-[#FFF0EB] text-[#8B3A1F]";
  return "bg-[#F5F6FA] text-[#5A6578]";
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const role = await getCurrentRole();
  if (role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const actionFilter = params.action ?? "";

  try {
  const logs = await getAuditLogs(actionFilter ? { action: actionFilter } : undefined);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#1A2332]">Audit Log</h1>
        <p className="mt-1 text-sm text-[#5A6578]">Track all system activities</p>
      </header>

      {/* Filter bar */}
      <section className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map((f) => {
          const isActive = actionFilter === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/audit?action=${f.value}` : "/audit"}
              className={
                isActive
                  ? "rounded-lg bg-[#0B2340] px-4 py-2 text-sm font-medium text-white"
                  : "rounded-lg border border-[#E8ECF1] bg-white px-4 py-2 text-sm font-medium text-[#5A6578] hover:bg-[#F5F6FA]"
              }
            >
              {f.label}
            </Link>
          );
        })}
      </section>

      {/* Audit table */}
      {logs.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#E8ECF1] bg-white p-8 text-center">
          <p className="text-base font-medium text-[#1A2332]">No audit logs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E8ECF1] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8ECF1] bg-[#F5F6FA]">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">Time</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">User</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">Action</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">Resource</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578] md:table-cell">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={`border-b border-[#E8ECF1] ${i % 2 === 1 ? "bg-[#F9FAFB]" : ""}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[#5A6578]">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1A2332]">{log.user_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${actionBadgeStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5A6578]">
                    {log.resource_type}
                    {log.resource_id && <span className="ml-1 text-xs text-[#8C95A6]">({log.resource_id.slice(0, 8)})</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-[#5A6578] md:table-cell">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  } catch (error) {
    console.error('Audit error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load audit log</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}
