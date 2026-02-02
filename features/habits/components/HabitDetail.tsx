"use client";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";
import { useHabits } from "../store";
import {
  calculateStreak,
  calculateSuccessRate,
  formatDisplayDate,
  getEntryStatus,
  getStatusLabels,
  getTodayKey,
} from "../utils";
import { HabitCalendar } from "./HabitCalendar";
import { WeekStrip } from "./WeekStrip";
import { HabitAnalytics } from "./HabitAnalytics";

type HabitDetailProps = {
  habitId: string;
};

type IconProps = React.SVGProps<SVGSVGElement>;

function IconArrowLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M8 6V4h8v2" strokeLinecap="round" />
      <path d="M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  );
}

export function HabitDetail({ habitId }: HabitDetailProps) {
  const { habits, removeHabit } = useHabits();
  const habit = habits.find((item) => item.id === habitId);

  if (!habit) {
    return (
      <div className="min-h-screen px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-3xl font-[var(--font-display)] font-semibold text-ink">
            Habit not found
          </h1>
          <p className="text-sm text-ink-muted">
            This habit may have been removed or the link is incorrect.
          </p>
          <ButtonLink href="/" variant="secondary">
            Back to dashboard
          </ButtonLink>
        </div>
      </div>
    );
  }

  const reviewWindowDays = habit.reviewWindowDays || 7;
  const streak = calculateStreak(habit);
  const successRate = calculateSuccessRate(habit, reviewWindowDays);
  const labels = getStatusLabels(habit.kind);
  const todayKey = getTodayKey();
  const todayStatus = getEntryStatus(habit, todayKey);

  return (
    <div className="min-h-screen px-3 py-4 sm:px-10 sm:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:gap-8">
        <header className="space-y-1.5 sm:space-y-3">
          <ButtonLink href="/" variant="ghost" size="sm" className="-ml-2 w-fit px-2.5">
            <IconArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs sm:sr-only sm:text-sm">Back to dashboard</span>
          </ButtonLink>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-xl font-[var(--font-display)] font-semibold text-ink sm:text-4xl">
              {habit.title}
            </h1>
            <Badge
              tone={habit.kind === "good" ? "good" : "bad"}
              className="w-fit px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs"
            >
              {habit.kind === "good" ? "Good habit" : "Bad habit"}
            </Badge>
          </div>
          <p className="text-[11px] text-ink-muted sm:text-sm">
            Track this habit daily using the calendar check-ins.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
          <StatTile
            className="p-3 sm:p-4"
            label="Today"
            value={formatDisplayDate()}
            hint="Local time"
          />
          <StatTile
            className="p-3 sm:p-4"
            label="Streak"
            value={`${streak} days`}
            hint="Current streak"
          />
          <StatTile
            className="col-span-2 p-3 sm:col-span-1 sm:p-4"
            label={`${reviewWindowDays}d success`}
            value={`${successRate}%`}
            hint={`Today: ${todayStatus ? labels[todayStatus] : "Not yet"}`}
          />
        </section>

        <HabitAnalytics habit={habit} />

        <Card className="space-y-3 p-3 sm:space-y-4 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-ink-subtle sm:text-xs sm:tracking-[0.3em]">
                Recent rhythm
              </p>
              <WeekStrip habit={habit} />
            </div>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="text-rust hover:text-rust"
              onClick={() => void removeHabit(habit.id)}
              aria-label="Remove habit"
              title="Remove habit"
            >
              <IconTrash className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <HabitCalendar habit={habit} />
        </Card>
      </div>
    </div>
  );
}
