import { redirect } from "next/navigation";
import {
  BrainCircuit,
  AlertTriangle,
  Target,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { getCurrentRole } from "@/lib/queries/auth";
import { getPredictions, getPredictionStats } from "@/lib/queries/predictions";
import { Badge } from "@/components/ui/badge";
import { PredictionActions } from "@/components/predictions/prediction-actions";
import { RootCauseAnalysis } from "@/components/predictions/root-cause-analysis";
import { AiBadge } from "@/components/ui/ai-badge";

const severityVariant = (severity: string) => {
  switch (severity) {
    case "critical":
      return "critical" as const;
    case "high":
      return "warning" as const;
    case "medium":
      return "default" as const;
    case "low":
      return "info" as const;
    default:
      return "default" as const;
  }
};

const daysColor = (days: number) => {
  if (days <= 7) return "text-[#8B2252]";
  if (days <= 14) return "text-[#0D8070]";
  return "text-[#0D8070]";
};

const confidenceColor = (confidence: number) => {
  const pct = confidence > 1 ? confidence : confidence * 100;
  if (pct > 80) return "bg-[#8B2252]";
  if (pct >= 60) return "bg-[#E07A5F]";
  return "bg-[#3B82F6]";
};

export default async function PredictionsPage() {
  const role = await getCurrentRole();
  if (role === "technician") redirect("/dashboard");

  const [predictions, stats] = await Promise.all([
    getPredictions(),
    getPredictionStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-2">
        <BrainCircuit className="h-6 w-6 text-[#1A2332]" />
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">AI Predictions</h1>
          <p className="text-sm text-[#5A6578]">
            Machine learning failure predictions across all equipment
          </p>
        </div>
      </header>

      {/* Stats cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-[#E8ECF1] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F5F0]">
            <BrainCircuit className="h-5 w-5 text-[#0D8070]" />
          </div>
          <div>
            <p className="text-sm text-[#5A6578]">Active Predictions</p>
            <p className="text-2xl font-bold text-[#1A2332]">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#E8ECF1] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E4E8]">
            <AlertTriangle className="h-5 w-5 text-[#8B2252]" />
          </div>
          <div>
            <p className="text-sm text-[#5A6578]">Critical / High</p>
            <p className="text-2xl font-bold text-[#1A2332]">
              {stats.critical + stats.high}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#E8ECF1] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0EB]">
            <Target className="h-5 w-5 text-[#0D8070]" />
          </div>
          <div>
            <p className="text-sm text-[#5A6578]">Avg Confidence</p>
            <p className="text-2xl font-bold text-[#1A2332]">
              {Math.round(stats.averageConfidence > 1 ? stats.averageConfidence : stats.averageConfidence * 100)}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#E8ECF1] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F5F0]">
            <ShieldCheck className="h-5 w-5 text-[#0D8070]" />
          </div>
          <div>
            <p className="text-sm text-[#5A6578]">Prevented This Month</p>
            <p className="text-2xl font-bold text-[#1A2332]">12</p>
          </div>
        </div>
      </section>

      {/* Predictions list */}
      {predictions.length === 0 ? (
        <section className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E8ECF1] bg-white p-8 text-center">
          <BrainCircuit className="h-8 w-8 text-[#0D8070]" />
          <p className="mt-3 text-base font-medium text-[#0D8070]">
            No active predictions — all equipment is running smoothly
          </p>
        </section>
      ) : (
        <div className="mx-auto max-w-4xl space-y-4">
          {predictions.map((prediction) => {
            const equipmentName = Array.isArray(prediction.equipment)
              ? prediction.equipment[0]?.name
              : prediction.equipment?.name;
            const equipmentType = Array.isArray(prediction.equipment)
              ? prediction.equipment[0]?.type
              : prediction.equipment?.type;
            const confidencePct = Math.round(prediction.confidence > 1 ? prediction.confidence : prediction.confidence * 100);
            const factors = Array.isArray(prediction.contributing_factors)
              ? (prediction.contributing_factors as string[])
              : [];

            return (
              <div
                key={prediction.id}
                className="rounded-xl border border-[#E8ECF1] bg-white p-6"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#1A2332]">
                      {equipmentName ?? "Unknown Equipment"}
                    </p>
                    <p className="text-sm text-[#5A6578]">
                      {equipmentType ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={severityVariant(prediction.severity)}>
                      {prediction.severity}
                    </Badge>
                    <span
                      className={`text-lg font-bold ${daysColor(prediction.days_until_failure)}`}
                    >
                      in {prediction.days_until_failure} days
                    </span>
                  </div>
                </div>

                {/* Middle section */}
                <div className="mt-4 space-y-3">
                  <h3 className="text-lg text-[#1A2332]">
                    {prediction.failure_type}
                  </h3>

                  {/* Confidence bar */}
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-[#E8ECF1]">
                      <div
                        className={`h-2 rounded-full ${confidenceColor(prediction.confidence)}`}
                        style={{ width: `${confidencePct}%` }}
                      />
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[#1A2332]">
                      {confidencePct}%
                      <AiBadge />
                    </span>
                  </div>

                  {/* Contributing factors */}
                  {factors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {factors.map((factor, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-[#F5F6FA] px-2.5 py-0.5 text-xs text-[#5A6578]"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recommended action */}
                  {prediction.recommended_action && (
                    <p className="flex items-start gap-2 text-sm italic text-[#5A6578]">
                      <Wrench className="mt-0.5 h-4 w-4 shrink-0" />
                      {prediction.recommended_action}
                    </p>
                  )}
                </div>

                {/* Bottom row — actions */}
                <div className="mt-5 border-t border-[#E8ECF1] pt-4 space-y-3">
                  <PredictionActions predictionId={prediction.id} />
                  <RootCauseAnalysis predictionId={prediction.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
