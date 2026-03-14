import Link from "next/link";
import { format, isPast } from "date-fns";
import { ClipboardList, Plus } from "lucide-react";
import { getWorkOrders, getWorkOrderStats } from "@/lib/queries/work-orders";
import { getCurrentRole } from "@/lib/queries/auth";
import { Badge } from "@/components/ui/badge";
import { WorkOrderActions } from "@/components/work-orders/work-order-actions";
import { ExportButton } from "@/components/ui/export-button";

const priorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent":
      return { variant: "critical" as const, className: "" };
    case "high":
      return { variant: "warning" as const, className: "" };
    case "medium":
      return { variant: "default" as const, className: "bg-[#FFF0EB] text-[#8B3A1F]" };
    case "low":
      return { variant: "info" as const, className: "" };
    default:
      return { variant: "default" as const, className: "" };
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case "open":
      return { variant: "info" as const, className: "" };
    case "in_progress":
      return { variant: "warning" as const, className: "" };
    case "completed":
      return { variant: "healthy" as const, className: "" };
    case "cancelled":
      return { variant: "default" as const, className: "bg-[#F5F6FA] text-[#8C95A6]" };
    default:
      return { variant: "default" as const, className: "" };
  }
};

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "";

  try {
  const [workOrders, stats, role] = await Promise.all([
    getWorkOrders(statusFilter ? { status: statusFilter } : undefined),
    getWorkOrderStats(),
    getCurrentRole(),
  ]);
  const canCreate = role === "manager" || role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Work Orders</h1>
          <p className="mt-1 text-sm text-[#5A6578]">
            Track and manage maintenance tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={workOrders as unknown as Record<string, unknown>[]}
            filename={`predictiq-work-orders-${new Date().toISOString().slice(0, 10)}.csv`}
            columns={[
              { key: "title", label: "Title" },
              { key: "equipment.name", label: "Equipment" },
              { key: "priority", label: "Priority" },
              { key: "status", label: "Status" },
              { key: "assigned_to_name", label: "Assigned To" },
              { key: "due_date", label: "Due Date" },
              { key: "estimated_cost", label: "Estimated Cost" },
            ]}
          />
          {canCreate && (
            <Link
              href="/work-orders/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#C4654D]"
            >
              <Plus className="h-4 w-4" />
              Create Work Order
            </Link>
          )}
        </div>
      </header>

      {/* Stats bar */}
      <section className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[#F5F6FA] px-3 py-1 text-sm font-medium text-[#1A2332]">
          All: {stats.total}
        </span>
        <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-sm font-medium text-[#1E40AF]">
          Open: {stats.open}
        </span>
        <span className="rounded-full bg-[#FFF0EB] px-3 py-1 text-sm font-medium text-[#0A6B5E]">
          In Progress: {stats.in_progress}
        </span>
        <span className="rounded-full bg-[#E6F5F0] px-3 py-1 text-sm font-medium text-[#0B2340]">
          Completed: {stats.completed}
        </span>
        <span className="rounded-full bg-[#F5F6FA] px-3 py-1 text-sm font-medium text-[#8C95A6]">
          Cancelled: {stats.cancelled}
        </span>
      </section>

      {/* Filter bar */}
      <section className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/work-orders?status=${f.value}` : "/work-orders"}
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

      {/* Work orders table */}
      {workOrders.length === 0 ? (
        <section className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E8ECF1] bg-white p-8 text-center">
          <ClipboardList className="h-8 w-8 text-[#8C95A6]" />
          <p className="mt-3 text-base font-medium text-[#1A2332]">
            No work orders found
          </p>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E8ECF1] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8ECF1] bg-[#F5F6FA]">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Priority
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Equipment
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578] md:table-cell">
                  Assigned To
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578] md:table-cell">
                  Due Date
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578] lg:table-cell">
                  Cost
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo, i) => {
                const pri = priorityBadge(wo.priority);
                const stat = statusBadge(wo.status);
                const equipmentName = Array.isArray(wo.equipment)
                  ? wo.equipment[0]?.name
                  : wo.equipment?.name;
                const isOverdue =
                  wo.due_date && isPast(new Date(wo.due_date)) && wo.status !== "completed" && wo.status !== "cancelled";

                return (
                  <tr
                    key={wo.id}
                    className={`border-b border-[#E8ECF1] transition hover:bg-[#F9FAFB] ${
                      i % 2 === 1 ? "bg-[#F9FAFB]" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Badge variant={pri.variant} className={pri.className}>
                        {wo.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A2332]">
                      {wo.title}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/equipment/${wo.equipment_id}`}
                        className="font-medium text-[#0D8070] hover:underline"
                      >
                        {equipmentName ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={stat.variant} className={stat.className}>
                        {wo.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {wo.assigned_to_name ? (
                        <span className="text-[#1A2332]">{wo.assigned_to_name}</span>
                      ) : (
                        <span className="text-[#8C95A6]">Unassigned</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {wo.due_date ? (
                        <span className={isOverdue ? "font-medium text-[#8B2252]" : "text-[#1A2332]"}>
                          {format(new Date(wo.due_date), "MMM dd, yyyy")}
                        </span>
                      ) : (
                        <span className="text-[#8C95A6]">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {wo.estimated_cost != null ? (
                        <span className="text-[#1A2332]">
                          ${Number(wo.estimated_cost).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#8C95A6]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <WorkOrderActions
                        workOrderId={wo.id}
                        status={wo.status}
                        completedAt={wo.completed_at}
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

  } catch (error) {
    console.error('Work orders error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load work orders</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}
