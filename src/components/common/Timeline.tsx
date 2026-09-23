import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface TimelineItem {
  id: string;
  title: string;
  meta?: string;
  description?: ReactNode;
  done?: boolean;
  right?: ReactNode;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              "absolute -left-[31px] top-1 size-3 rounded-full border-2 border-card",
              item.done === false ? "bg-border" : "bg-primary",
            )}
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
              {item.description ? (
                <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
              ) : null}
            </div>
            {item.right}
          </div>
        </li>
      ))}
    </ol>
  );
}
