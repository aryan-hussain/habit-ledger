import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { HabitWithEntries } from "../types";
import {
  calculateStreak,
  calculateSuccessRate,
  getEntryStatus,
  getStatusLabels,
  getTodayKey,
} from "../utils";
import { useHabits } from "../store";
import { WeekStrip } from "./WeekStrip";

type HabitCardProps = {
  habit: HabitWithEntries;
};

export function HabitCard({ habit }: HabitCardProps) {
  const { setHabitStatus, clearHabitStatus, removeHabit } = useHabits();
  const todayKey = getTodayKey();
  const status = getEntryStatus(habit, todayKey);
  const labels = getStatusLabels(habit.kind);
  const streak = calculateStreak(habit);
  const successRate = calculateSuccessRate(habit, 7);

  return (
    <div className="rounded-[var(--radius-soft)] border border-border bg-surface/80 p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink">{habit.title}</h3>
            <Badge tone={habit.kind === "good" ? "good" : "bad"}>
              {habit.kind === "good" ? "Good habit" : "Bad habit"}
            </Badge>
          </div>
          <p className="text-sm text-ink-muted">Check in for today and keep the streak alive.</p>
          <WeekStrip habit={habit} />
          <div className="flex flex-wrap gap-3 text-xs text-ink-muted">
            <span className="rounded-[var(--radius-pill)] bg-surface-3 px-2 py-1">
              Streak: {streak}d
            </span>
            <span className="rounded-[var(--radius-pill)] bg-surface-3 px-2 py-1">
              7d success: {successRate}%
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant={status === "success" ? "primary" : "secondary"}
            type="button"
            aria-pressed={status === "success"}
            onClick={() => void setHabitStatus(habit.id, todayKey, "success")}
          >
            {labels.success}
          </Button>
          <Button
            size="sm"
            variant={status === "fail" ? "primary" : "secondary"}
            type="button"
            aria-pressed={status === "fail"}
            onClick={() => void setHabitStatus(habit.id, todayKey, "fail")}
          >
            {labels.fail}
          </Button>
          {status ? (
            <button
              className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle hover:text-ink"
              onClick={() => void clearHabitStatus(habit.id, todayKey)}
            >
              Clear
            </button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="text-rust hover:text-rust"
            type="button"
            onClick={() => void removeHabit(habit.id)}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
