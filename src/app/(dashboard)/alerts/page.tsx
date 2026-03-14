import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getAlerts, getAlertStats } from "@/lib/queries/alerts";
import { Badge } from "@/components/ui/badge";
import { AlertActionButtons } from "@/components/alerts/alert-action-buttons";
import { ExportButton } from "@/components/ui/export-button";

const severityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return { variant: "critical" as const, className: "" };
    case "major":
      return {
        variant: "warning" as const,
        className: "bg-[#FFF0EB] text-[#8B3A1F]",
      };
    case "minor":
      return {
        variant: "default" as const,
        className: "bg-[#FFF0EB] text-[#8B3A1F]",
      };
    case "info":
      return { variant: "info" as const, className: "" };
    default:
      return { variant: "default" as const, className: "" };
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case "new":
      return { variant: "info" as const, className: "" };
    case "acknowledged":
      return {
        variant: "default" as const,
        className: "bg-[#FFF0EB] text-[#8B3A1F]",
      };
    case "resolved":
      return { variant: "healthy" as const, className: "" };
    default:
      return { variant: "default" as const, className: "" };
  }
};

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Resolved", value: "resolved" },
];

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; facility?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "";
  const facilityId = params.facility;

  const filters: { status?: string; facilityId?: string } = {};
  if (statusFilter) filters.status = statusFilter;
  if (facilityId) filters.facilityId = facilityId;

  const [alerts, stats] = await Promise.all([
    getAlerts(Object.keys(filters).length > 0 ? filters : undefined),
    getAlertStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Alerts</h1>
          <p className="mt-1 text-sm text-[#5A6578]">
            Monitor and manage equipment alerts
          </p>
        </div>
        <ExportButton
          data={alerts as unknown as Record<string, unknown>[]}
          filename={`predictiq-alerts-${new Date().toISOString().slice(0, 10)}.csv`}
          columns={[
            { key: "severity", label: "Severity" },
            { key: "equipment.name", label: "Equipment" },
            { key: "title", label: "Title" },
            { key: "message", label: "Message" },
            { key: "status", label: "Status" },
            { key: "created_at", label: "Created At" },
          ]}
        />
      </header>

      {/* Stats bar */}
      <section className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[#F5F6FA] px-3 py-1 text-sm font-medium text-[#1A2332]">
          All: {stats.total}
        </span>
        <span className="rounded-full bg-[#F0E4E8] px-3 py-1 text-sm font-medium text-[#6B1D3A]">
          Critical: {stats.bySeverity.critical}
        </span>
        <span className="rounded-full bg-[#FFF0EB] px-3 py-1 text-sm font-medium text-[#8B3A1F]">
          Major: {stats.bySeverity.major}
        </span>
        <span className="rounded-full bg-[#FFF0EB] px-3 py-1 text-sm font-medium text-[#8B3A1F]">
          Minor: {stats.bySeverity.minor}
        </span>
        <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-sm font-medium text-[#1E40AF]">
          Info: {stats.bySeverity.info}
        </span>
      </section>

      {/* Filter bar */}
      <section className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/alerts?status=${f.value}` : "/alerts"}
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

      {/* Alerts table */}
      {alerts.length === 0 ? (
        <section className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E8ECF1] bg-white p-8 text-center">
          <Bell className="h-8 w-8 text-[#8C95A6]" />
          <p className="mt-3 text-base font-medium text-[#1A2332]">
            No alerts found
          </p>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E8ECF1] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8ECF1] bg-[#F5F6FA]">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Severity
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Equipment
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578] md:table-cell">
                  Message
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578] sm:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, i) => {
                const sev = severityBadge(alert.severity);
                const stat = statusBadge(alert.status);
                const equipmentName = Array.isArray(alert.equipment)
                  ? alert.equipment[0]?.name
                  : alert.equipment?.name;

                return (
                  <tr
                    key={alert.id}
                    className={`border-b border-[#E8ECF1] transition hover:bg-[#F9FAFB] ${
                      i % 2 === 1 ? "bg-[#F9FAFB]" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Badge variant={sev.variant} className={sev.className}>
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/equipment/${alert.equipment_id}`}
                        className="font-medium text-[#0D8070] hover:underline"
                      >
                        {equipmentName ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A2332]">
                      {alert.title}
                    </td>
                    <td className="hidden px-4 py-3 text-[#5A6578] md:table-cell">
                      {alert.message.length > 60
                        ? alert.message.slice(0, 60) + "..."
                        : alert.message}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={stat.variant} className={stat.className}>
                        {alert.status}
                      </Badge>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-[#5A6578] sm:table-cell">
                      {formatDistanceToNow(new Date(alert.created_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <AlertActionButtons
                        alertId={alert.id}
                        status={alert.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
