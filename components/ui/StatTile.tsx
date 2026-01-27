import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type StatTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  hint?: string;
};

export function StatTile({ label, value, hint, className, ...props }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-soft)] border border-border bg-surface/80 p-4 shadow-[var(--shadow-soft)]",
        className
      )}
      {...props}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-subtle">
        {label}
      </p>
      <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
      {hint ? <p className="mt-2 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
