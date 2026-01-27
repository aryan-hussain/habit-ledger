import type { HabitWithEntries } from "../types";
import { getLastNDays } from "../utils";
import { cn } from "@/lib/cn";

type WeekStripProps = {
  habit: HabitWithEntries;
  days?: number;
};

export function WeekStrip({ habit, days = 7 }: WeekStripProps) {
  const keys = getLastNDays(days);

  return (
    <div className="mt-3 flex items-center gap-1.5">
      {keys.map((key) => {
        const entry = habit.entries[key];
        const status = entry?.status;
        const label = status
          ? `${key}: ${status === "success" ? "Success" : "Fail"}`
          : `${key}: No entry`;

        return (
          <span
            key={key}
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              status === "success"
                ? "bg-olive"
                : status === "fail"
                  ? "bg-rust"
                  : "bg-surface-3"
            )}
            aria-label={label}
            title={label}
          />
        );
      })}
    </div>
  );
}
