import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const tones = [
  "bg-primary-soft text-accent-foreground",
  "bg-info-soft text-info",
  "bg-warning-soft text-warning-foreground",
  "bg-success-soft text-success",
  "bg-secondary text-secondary-foreground",
];

export function PatientAvatar({
  name,
  tone = 1,
  size = "md",
}: {
  name: string;
  tone?: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-base",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        tones[(tone - 1) % tones.length],
        sizes[size],
      )}
      aria-hidden
    >
      {initials(name) || name.slice(0, 2).toUpperCase()}
    </span>
  );
}
