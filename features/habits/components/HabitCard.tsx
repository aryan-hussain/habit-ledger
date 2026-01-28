import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
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
  const { removeHabit } = useHabits();
  const todayKey = getTodayKey();
  const status = getEntryStatus(habit, todayKey);
  const labels = getStatusLabels(habit.kind);
  const streak = calculateStreak(habit);
  const reviewWindowDays = habit.reviewWindowDays || 7;
  const successRate = calculateSuccessRate(habit, reviewWindowDays);

  return (
    <div className="rounded-[var(--radius-soft)] border border-border bg-surface/80 p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4">
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
              {reviewWindowDays}d success: {successRate}%
            </span>
            <span className="rounded-[var(--radius-pill)] bg-surface-3 px-2 py-1">
              Today: {status ? labels[status] : "Not yet"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ButtonLink href={`/habits/${habit.id}`} variant="secondary" size="sm">
            Open details
          </ButtonLink>
          <button
            className="text-xs font-semibold uppercase tracking-[0.2em] text-rust hover:text-rust"
            onClick={() => void removeHabit(habit.id)}
          >
            Remove habit
          </button>
        </div>
      </div>
    </div>
  );
}
