import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Bell,
  BrainCircuit,
  ClipboardList,
  TrendingUp,
  Wrench,
  Users,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentAlerts,
  getUpcomingPredictions,
} from "@/lib/queries/dashboard";
import { getEquipmentStats } from "@/lib/queries/equipment";
import { getCurrentUser, getCurrentRole } from "@/lib/queries/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { HealthDistributionChart } from "@/components/dashboard/health-distribution-chart";
import { UserDistributionChart } from "@/components/dashboard/user-distribution-chart";
import { createClient } from "@/lib/supabase/server";
import { AiDashboardSummary } from "@/components/dashboard/ai-dashboard-summary";
import { AiMaintenancePlan } from "@/components/dashboard/ai-maintenance-plan";

type BadgeVariant = "healthy" | "warning" | "critical" | "info" | "default";

function getSeverityVariant(severity: string | null): BadgeVariant {
  const value = (severity ?? "").toLowerCase();
  if (value === "critical") return "critical";
  if (value === "major" || value === "warning" || value === "high") return "warning";
  if (value === "minor" || value === "low") return "healthy";
  if (value === "info") return "info";
  return "default";
}

function getEquipmentName(equipment: unknown) {
  if (!equipment) return "Unknown equipment";
  if (Array.isArray(equipment)) {
    const first = equipment[0] as { name?: string } | undefined;
    return first?.name ?? "Unknown equipment";
  }
  return (equipment as { name?: string }).name ?? "Unknown equipment";
}

function getConfidenceColor(confidence: number) {
  if (confidence > 80) return "#F53642";
  if (confidence >= 60) return "#3B82F6";
  return "#3B82F6";
}

const priorityVariant = (priority: string): BadgeVariant => {
  switch (priority) {
    case "urgent": return "critical";
    case "high": return "warning";
    case "medium": return "default";
    case "low": return "info";
    default: return "default";
  }
};

const statusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "open": return "info";
    case "in_progress": return "warning";
    case "completed": return "healthy";
    default: return "default";
  }
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ facility?: string }>;
}) {
  const params = await searchParams;
  const facilityId = params.facility;

  try {
  const role = await getCurrentRole();
  const currentUser = await getCurrentUser();

  const [statsData, recentAlerts] = await Promise.all([
    getDashboardStats(facilityId),
    getRecentAlerts(5),
  ]);

  // ==================== TECHNICIAN VIEW ====================
  if (role === "technician") {
    const supabase = await createClient();
    const userName = currentUser?.full_name ?? "";

    const { data: myWorkOrders } = await supabase
      .from("work_orders")
      .select("*, equipment(name)")
      .eq("assigned_to_name", userName)
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false });

    const myWOs = myWorkOrders ?? [];

    const { count: newAlertCount } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "new");

    const techStats = [
      { label: "My Work Orders", value: myWOs.length, icon: ClipboardList, iconBg: "#DBEAFE", iconColor: "#3B82F6" },
      { label: "New Alerts", value: newAlertCount ?? 0, icon: Bell, iconBg: "#FEE2E2", iconColor: "#F53642" },
      { label: "Equipment Monitored", value: statsData.totalEquipment, icon: Wrench, iconBg: "#DBEAFE", iconColor: "#3B82F6" },
    ];

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-[#0B2340]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#5A6578]">Welcome back, {userName}</p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {techStats.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label}>
                <CardContent className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: item.iconBg }}>
                    <Icon className="h-5 w-5" style={{ color: item.iconColor }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0B2340]">{item.value}</p>
                    <p className="text-sm text-[#5A6578]">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-[#3B82F6]" />
                My Assigned Work Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myWOs.length === 0 ? (
                <p className="rounded-lg border border-[#E8ECF1] bg-white p-4 text-sm text-[#5A6578]">
                  No work orders assigned to you
                </p>
              ) : (
                myWOs.map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between rounded-lg border border-[#E8ECF1] bg-white p-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={priorityVariant(wo.priority)}>{wo.priority}</Badge>
                      <div>
                        <p className="font-semibold text-[#0B2340]">{wo.title}</p>
                        <p className="text-sm text-[#5A6578]">{getEquipmentName(wo.equipment)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant(wo.status)}>{wo.status.replace("_", " ")}</Badge>
                      {wo.due_date && (
                        <span className="text-xs text-[#5A6578]">Due {wo.due_date}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-[#3B82F6]" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAlerts.length === 0 ? (
                <p className="rounded-lg border border-[#E8ECF1] bg-white p-4 text-sm text-[#5A6578]">No data yet</p>
              ) : (
                recentAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border border-[#E8ECF1] bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-1"><Badge variant={getSeverityVariant(alert.severity)}>{alert.severity}</Badge></div>
                        <p className="font-semibold text-[#0B2340]">{getEquipmentName(alert.equipment)}</p>
                        <p className="text-sm text-[#5A6578]">{alert.title}</p>
                      </div>
                      <p className="whitespace-nowrap text-xs text-[#5A6578]">
                        {alert.created_at ? formatDistanceToNow(new Date(alert.created_at), { addSuffix: true }) : "Unknown time"}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="pt-1">
                <Link href="/alerts" className="text-sm font-medium text-[#3B82F6] hover:underline">View All Alerts</Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  // ==================== MANAGER / ADMIN SHARED VIEW ====================
  const [upcomingPredictions, equipmentStats] = await Promise.all([
    getUpcomingPredictions(3),
    getEquipmentStats(),
  ]);

  const stats = [
    { label: "Total Equipment", value: statsData.totalEquipment, icon: Wrench, iconBg: "#DBEAFE", iconColor: "#3B82F6" },
    { label: "Critical Alerts", value: statsData.criticalAlerts, icon: Bell, iconBg: "#FEE2E2", iconColor: "#F53642" },
    { label: "Active Predictions", value: statsData.activePredictions, icon: BrainCircuit, iconBg: "#FEF3C7", iconColor: "#F59E0B" },
    { label: "Open Work Orders", value: statsData.openWorkOrders, icon: ClipboardList, iconBg: "#DBEAFE", iconColor: "#3B82F6" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0B2340]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#5A6578]">Equipment health overview</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: item.iconBg }}>
                  <Icon className="h-5 w-5" style={{ color: item.iconColor }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B2340]">{item.value}</p>
                  <p className="text-sm text-[#5A6578]">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* AI Dashboard Summary */}
      <AiDashboardSummary />

      {/* Equipment Health Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-[#3B82F6]" />
            Equipment Health Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HealthDistributionChart
            healthy={equipmentStats.healthy}
            warning={equipmentStats.warning}
            critical={equipmentStats.critical}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/equipment" className="rounded-lg border border-[#E8ECF1] bg-[#FEE2E2] p-4 transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#991B1B]" />
            <span className="font-medium text-[#991B1B]">Critical Equipment</span>
          </div>
        </Link>
        <Link href="/work-orders/new" className="rounded-lg border border-[#E8ECF1] bg-[#FEF3C7] p-4 transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-[#92400E]" />
            <span className="font-medium text-[#92400E]">Create Work Order</span>
          </div>
        </Link>
        <Link href="/predictions" className="rounded-lg bg-[#0B2340] p-4 transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-white" />
            <span className="font-medium text-white">View Predictions</span>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-[#3B82F6]" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="rounded-lg border border-[#E8ECF1] bg-white p-4 text-sm text-[#5A6578]">No data yet</p>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="rounded-lg border border-[#E8ECF1] bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1"><Badge variant={getSeverityVariant(alert.severity)}>{alert.severity}</Badge></div>
                      <p className="font-semibold text-[#0B2340]">{getEquipmentName(alert.equipment)}</p>
                      <p className="text-sm text-[#5A6578]">{alert.title}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-[#5A6578]">
                      {alert.created_at ? formatDistanceToNow(new Date(alert.created_at), { addSuffix: true }) : "Unknown time"}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="pt-1">
              <Link href="/alerts" className="text-sm font-medium text-[#3B82F6] hover:underline">View All Alerts</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-[#3B82F6]" />
              Upcoming Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPredictions.length === 0 ? (
              <p className="rounded-lg border border-[#E8ECF1] bg-white p-4 text-sm text-[#5A6578]">No data yet</p>
            ) : (
              upcomingPredictions.map((prediction) => (
                <div key={prediction.id} className="rounded-lg border border-[#E8ECF1] bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#0B2340]">{getEquipmentName(prediction.equipment)}</p>
                      <p className="text-sm text-[#5A6578]">{prediction.failure_type}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-[#5A6578]">
                      {prediction.days_until_failure != null ? `in ${prediction.days_until_failure} days` : "No ETA"}
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-[#5A6578]">Confidence</span>
                      <span className="text-xs font-medium text-[#0B2340]">{Math.round(prediction.confidence)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F5F6FA]">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, prediction.confidence))}%`,
                          backgroundColor: getConfidenceColor(prediction.confidence),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="pt-1">
              <Link href="/predictions" className="text-sm font-medium text-[#3B82F6] hover:underline">View All Predictions</Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* AI Maintenance Recommendations */}
      <AiMaintenancePlan facilityId={facilityId} />

      {/* Admin-only: System Overview + User Distribution */}
      {role === "admin" && <AdminSection />}
    </div>
  );

  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load dashboard</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}

async function AdminSection() {
  const { getUserStats } = await import("@/lib/queries/users");
  const userStats = await getUserStats();

  return (
    <>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DBEAFE]">
              <Users className="h-5 w-5 text-[#1E40AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2340]">{userStats.total}</p>
              <p className="text-sm text-[#5A6578]">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCFCE7]">
              <Activity className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2340]">{userStats.total}</p>
              <p className="text-sm text-[#5A6578]">Active Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF3C7]">
              <ShieldCheck className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2340]">47</p>
              <p className="text-sm text-[#5A6578]">Audit Actions This Week</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-[#3B82F6]" />
            User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserDistributionChart
            managers={userStats.managers}
            technicians={userStats.technicians}
            admins={userStats.admins}
          />
        </CardContent>
      </Card>
    </>
  );
}
