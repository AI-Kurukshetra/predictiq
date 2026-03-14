import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Wrench,
  AlertTriangle,
  Activity,
  Bell,
  Hash,
  CheckCircle,
  ClipboardList,
  Plus,
  Settings2,
} from "lucide-react";
import { getEquipmentById } from "@/lib/queries/equipment";
import { getCurrentRole } from "@/lib/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { HealthScore } from "@/components/equipment/health-score";
import { SensorChart } from "@/components/equipment/sensor-chart";
import { SensorConfig } from "@/components/equipment/sensor-config";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertActionButtons } from "@/components/alerts/alert-action-buttons";
import { AiHealthSummary } from "@/components/equipment/ai-health-summary";

function getFacilityName(
  facilities?: { name: string } | { name: string }[] | null
) {
  if (!facilities) return null;
  if (Array.isArray(facilities)) return facilities[0]?.name ?? null;
  return facilities.name;
}

const statusVariant = (status: string) => {
  switch (status) {
    case "healthy":
      return "healthy" as const;
    case "warning":
      return "warning" as const;
    case "critical":
      return "critical" as const;
    default:
      return "default" as const;
  }
};

const severityVariant = (severity: string) => {
  switch (severity) {
    case "critical":
    case "high":
      return "critical" as const;
    case "medium":
      return "warning" as const;
    case "low":
      return "info" as const;
    default:
      return "default" as const;
  }
};

const maintenanceTypeBadge = (type: string) => {
  switch (type) {
    case "preventive":
      return "healthy" as const;
    case "corrective":
      return "warning" as const;
    case "predictive":
      return "info" as const;
    case "emergency":
      return "critical" as const;
    default:
      return "default" as const;
  }
};

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
  const [{ equipment, sensors, latestReadings, activePredictions, recentAlerts }, role] =
    await Promise.all([getEquipmentById(id), getCurrentRole()]);

  if (!equipment) {
    notFound();
  }

  const canEdit = role === "manager" || role === "admin";

  // Fetch maintenance history + latest sensor readings for config
  const supabase = await createClient();
  const { data: maintenanceHistory } = await supabase
    .from("maintenance_history")
    .select("*")
    .eq("equipment_id", id)
    .order("performed_at", { ascending: false });

  // Get latest reading per sensor for sensor config
  const sensorLatestValues: Record<string, number | null> = {};
  for (const sensor of sensors) {
    const readings = latestReadings.find((r) => r.sensor_id === sensor.id)?.readings ?? [];
    sensorLatestValues[sensor.id] = readings.length > 0 ? readings[0].value : null;
  }

  const history = maintenanceHistory ?? [];

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/equipment"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D8070] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Equipment
      </Link>

      {/* Equipment header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">
            {equipment.name}
          </h1>
          <p className="mt-1 text-[#5A6578]">
            {equipment.type}
            {getFacilityName(equipment.facilities) &&
              ` · ${getFacilityName(equipment.facilities)}`}
          </p>
          <div className="mt-3 flex gap-2">
            {canEdit && (
              <Link
                href={`/work-orders/new?equipment=${id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#C4654D]"
              >
                <Plus className="h-4 w-4" />
                Create Work Order
              </Link>
            )}
            {role === "admin" && (
              <Link
                href={`/equipment/${id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#0B2340] px-4 py-2 text-sm font-medium text-[#0B2340] transition hover:bg-[#F5F6FA]"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HealthScore score={equipment.health_score} size="lg" />
          <Badge variant={statusVariant(equipment.status)}>
            {equipment.status}
          </Badge>
        </div>
      </div>

      {/* AI Health Summary */}
      <AiHealthSummary equipmentId={id} />

      {/* Metadata row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-start gap-3 rounded-lg bg-[#F5F6FA] p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6578]" />
          <div>
            <p className="text-xs text-[#5A6578]">Location</p>
            <p className="text-sm font-medium text-[#1A2332]">
              {equipment.location_zone}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-[#F5F6FA] p-4">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6578]" />
          <div>
            <p className="text-xs text-[#5A6578]">Installed</p>
            <p className="text-sm font-medium text-[#1A2332]">
              {equipment.install_date
                ? format(new Date(equipment.install_date), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-[#F5F6FA] p-4">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6578]" />
          <div>
            <p className="text-xs text-[#5A6578]">Last Maintenance</p>
            <p className="text-sm font-medium text-[#1A2332]">
              {equipment.last_maintenance
                ? formatDistanceToNow(new Date(equipment.last_maintenance), {
                    addSuffix: true,
                  })
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-[#F5F6FA] p-4">
          <Hash className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6578]" />
          <div>
            <p className="text-xs text-[#5A6578]">Serial</p>
            <p className="text-sm font-medium text-[#1A2332]">
              {equipment.serial_number || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Charts */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2332]">
          <Activity className="h-5 w-5 text-[#5A6578]" />
          Sensor Readings
        </h2>
        {sensors.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sensors.map((sensor) => {
              const sensorReadings =
                latestReadings.find((r) => r.sensor_id === sensor.id)
                  ?.readings ?? [];
              return (
                <Card key={sensor.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {sensor.type.charAt(0).toUpperCase() +
                        sensor.type.slice(1)}{" "}
                      ({sensor.unit})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SensorChart
                      readings={sensorReadings}
                      sensorType={sensor.type}
                      unit={sensor.unit}
                      minThreshold={sensor.min_threshold ?? null}
                      maxThreshold={sensor.max_threshold ?? null}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#5A6578]">No sensors connected</p>
        )}
      </section>

      {/* Sensor Configuration */}
      {sensors.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2332]">
            <Settings2 className="h-5 w-5 text-[#5A6578]" />
            Sensor Configuration
          </h2>
          <div className="mt-4">
            <SensorConfig
              sensors={sensors.map((s) => ({
                id: s.id,
                type: s.type,
                unit: s.unit,
                min_threshold: s.min_threshold ?? null,
                max_threshold: s.max_threshold ?? null,
                is_active: s.is_active ?? true,
              }))}
              latestReadings={sensorLatestValues}
              canEdit={canEdit}
            />
          </div>
        </section>
      )}

      {/* Active Predictions */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2332]">
          <AlertTriangle className="h-5 w-5 text-[#5A6578]" />
          Active Predictions
        </h2>
        {activePredictions.length > 0 ? (
          <div className="mt-4 space-y-3">
            {activePredictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1A2332]">
                          {prediction.failure_type}
                        </p>
                        <Badge
                          variant={severityVariant(prediction.severity)}
                        >
                          {prediction.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#5A6578]">
                        {prediction.recommended_action}
                      </p>
                      {prediction.contributing_factors &&
                        Array.isArray(prediction.contributing_factors) &&
                        prediction.contributing_factors.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(
                              prediction.contributing_factors as string[]
                            ).map((factor, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-[#F5F6FA] px-2 py-0.5 text-xs text-[#5A6578]"
                              >
                                {factor}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex shrink-0 items-start gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-[#5A6578]">Confidence</p>
                        <p className="font-semibold text-[#1A2332]">
                          {Math.round(prediction.confidence)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#5A6578]">
                          Days until failure
                        </p>
                        <p className="font-semibold text-[#1A2332]">
                          {prediction.days_until_failure}
                        </p>
                      </div>
                      <Link
                        href={`/work-orders/new?equipment=${id}`}
                        className="rounded-lg bg-[#E07A5F] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#C4654D]"
                      >
                        Create Work Order
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#0B2340]">
            <CheckCircle className="h-4 w-4" />
            No active predictions for this equipment
          </div>
        )}
      </section>

      {/* Recent Alerts */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2332]">
          <Bell className="h-5 w-5 text-[#5A6578]" />
          Recent Alerts
        </h2>
        {recentAlerts.length > 0 ? (
          <div className="mt-4 space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col gap-2 rounded-lg border border-[#E8ECF1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <Badge variant={severityVariant(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-[#1A2332]">
                      {alert.title}
                    </p>
                    <p className="text-xs text-[#5A6578]">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertActionButtons alertId={alert.id} status={alert.status} />
                  <p className="shrink-0 text-xs text-[#5A6578]">
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#5A6578]">No recent alerts</p>
        )}
      </section>

      {/* Maintenance History */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2332]">
          <ClipboardList className="h-5 w-5 text-[#5A6578]" />
          Maintenance History
        </h2>
        {history.length > 0 ? (
          <div className="mt-4 space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 rounded-lg border border-[#E8ECF1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <Badge variant={maintenanceTypeBadge(entry.type)}>
                    {entry.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-[#1A2332]">
                      {entry.description}
                    </p>
                    <p className="text-xs text-[#5A6578]">
                      {entry.performed_by_name && `By ${entry.performed_by_name}`}
                      {entry.cost != null && ` · $${Number(entry.cost).toLocaleString()}`}
                      {entry.downtime_hours != null && ` · ${entry.downtime_hours} hours downtime`}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-xs text-[#5A6578]">
                  {entry.performed_at
                    ? format(new Date(entry.performed_at), "MMM dd, yyyy")
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#5A6578]">
            No maintenance records yet
          </p>
        )}
      </section>
    </div>
  );

  } catch (error) {
    console.error('Equipment detail error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load equipment details</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}
