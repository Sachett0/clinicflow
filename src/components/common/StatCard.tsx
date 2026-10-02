import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive: boolean };
  icon: LucideIcon;
}) {
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-[var(--shadow-float)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-accent-foreground">
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
              trend.positive
                ? "bg-success-soft text-success"
                : "bg-destructive-soft text-destructive",
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend.value}
          </span>
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}
