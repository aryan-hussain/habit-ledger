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
  getStatusLabels,
  getTodayKey,
} from "../utils";
import { HabitCalendar } from "./HabitCalendar";
import { WeekStrip } from "./WeekStrip";
import { HabitAnalytics } from "./HabitAnalytics";

type HabitDetailProps = {
  habitId: string;
};

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
  const todayStatus = habit.entries[todayKey]?.status ?? null;

  return (
    <div className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-3">
          <ButtonLink href="/" variant="ghost" size="sm">
            Back
          </ButtonLink>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-[var(--font-display)] font-semibold text-ink">
              {habit.title}
            </h1>
            <Badge tone={habit.kind === "good" ? "good" : "bad"}>
              {habit.kind === "good" ? "Good habit" : "Bad habit"}
            </Badge>
          </div>
          <p className="text-sm text-ink-muted">
            Track this habit daily using the calendar check-ins.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Today" value={formatDisplayDate()} hint="Local time" />
          <StatTile label="Streak" value={`${streak} days`} hint="Current streak" />
          <StatTile
            label={`${reviewWindowDays}d success`}
            value={`${successRate}%`}
            hint={`Today: ${todayStatus ? labels[todayStatus] : "Not yet"}`}
          />
        </section>

        <HabitAnalytics habit={habit} />

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle">
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
            >
              Remove habit
            </Button>
          </div>
          <HabitCalendar habit={habit} />
        </Card>
      </div>
    </div>
  );
}
