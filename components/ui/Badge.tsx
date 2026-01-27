import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "good" | "bad" | "neutral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneStyles: Record<BadgeTone, string> = {
  good: "border-olive/40 bg-olive/15 text-olive",
  bad: "border-rust/40 bg-rust/15 text-rust",
  neutral: "border-border bg-surface-3 text-ink-muted",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
