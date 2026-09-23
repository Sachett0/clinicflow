import { Activity } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Activity className="size-5" />
      </span>
      {!compact ? (
        <span className="text-base font-semibold tracking-tight text-foreground">ClinicFlow</span>
      ) : null}
    </span>
  );
}
