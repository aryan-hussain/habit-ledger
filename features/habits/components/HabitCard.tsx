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

type IconProps = React.SVGProps<SVGSVGElement>;

function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    <div className="rounded-[var(--radius-soft)] border border-border bg-surface/80 p-3 shadow-[var(--shadow-soft)] sm:p-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink sm:text-lg">{habit.title}</h3>
            <Badge tone={habit.kind === "good" ? "good" : "bad"}>
              <span className="sm:hidden">{habit.kind === "good" ? "Good" : "Bad"}</span>
              <span className="hidden sm:inline">
                {habit.kind === "good" ? "Good habit" : "Bad habit"}
              </span>
            </Badge>
          </div>
          <p className="hidden text-sm text-ink-muted sm:block">
            Check in for today and keep the streak alive.
          </p>
          <WeekStrip habit={habit} />
          <div className="flex flex-wrap gap-2 text-xs text-ink-muted sm:gap-3">
            <span className="rounded-[var(--radius-pill)] bg-surface-3 px-2 py-1">
              Streak: {streak}d
            </span>
            <span className="rounded-[var(--radius-pill)] bg-surface-3 px-2 py-1">
              {successRate}% success
            </span>
            <span className="rounded-[var(--radius-pill)] bg-surface-3 px-2 py-1">
              {status ? labels[status] : "Pending"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ButtonLink
            href={`/habits/${habit.id}`}
            variant="secondary"
            size="sm"
            className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-[13px]"
          >
            Details
          </ButtonLink>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-pill)] text-rust transition hover:bg-rust/10 sm:h-9 sm:w-9"
            onClick={() => void removeHabit(habit.id)}
            aria-label="Remove habit"
            title="Remove habit"
          >
            <IconTrash className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
