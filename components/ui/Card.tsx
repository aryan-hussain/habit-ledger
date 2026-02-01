import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-surface/90 p-4 md:p-6 shadow-[var(--shadow-card)] backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
