"use client";

type HealthScoreProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { px: 40, stroke: 4, textClass: "text-xs" },
  md: { px: 56, stroke: 5, textClass: "text-sm" },
  lg: { px: 80, stroke: 7, textClass: "text-lg" },
} as const;

function getRingColor(score: number) {
  if (score >= 80) return "#2ADE6B";
  if (score >= 50) return "#F59E0B";
  return "#F53642";
}

export function HealthScore({ score, size = "md" }: HealthScoreProps) {
  const config = sizeMap[size];
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (config.px - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clampedScore / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: config.px, height: config.px }}
    >
      <svg
        width={config.px}
        height={config.px}
        viewBox={`0 0 ${config.px} ${config.px}`}
        className="-rotate-90"
      >
        <circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          stroke="#E8ECF1"
          strokeWidth={config.stroke}
        />
        <circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          stroke={getRingColor(clampedScore)}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className={`absolute font-semibold text-[#1A2332] ${config.textClass}`}>
        {clampedScore}
      </span>
    </div>
  );
}

export default HealthScore;
