import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "healthy" | "warning" | "critical" | "info" | "default";

const variantClasses: Record<BadgeVariant, string> = {
  healthy: "bg-[#DCFCE7] text-[#166534]",
  warning: "bg-[#FEF3C7] text-[#92400E]",
  critical: "bg-[#FEE2E2] text-[#991B1B]",
  info: "bg-[#DBEAFE] text-[#1E40AF]",
  default: "bg-[#F5F6FA] text-[#5A6578]",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;
