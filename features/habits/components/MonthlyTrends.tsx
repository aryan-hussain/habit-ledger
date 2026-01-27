"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useHabits } from "../store";
import {
  addMonths,
  formatMonthLabel,
  getCalendarDays,
  getDailySummary,
  getTodayKey,
} from "../utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type HabitFilter = "all" | "good" | "bad";
type ViewMode = "cards" | "heatmap";

function getRateTone(rate: number) {
  if (rate >= 80) {
    return "bg-olive";
  }
  if (rate >= 50) {
    return "bg-accent";
  }
  return "bg-rust";
}

function mixChannel(from: number, to: number, ratio: number) {
  return Math.round(from + (to - from) * ratio);
}

function getHeatColor(rate: number) {
  const clamped = Math.max(0, Math.min(100, rate)) / 100;
  const base = { r: 253, g: 249, b: 241 };
  const low = { r: 179, g: 74, b: 53 };
  const high = { r: 95, g: 118, b: 81 };
  const target = {
    r: mixChannel(low.r, high.r, clamped),
    g: mixChannel(low.g, high.g, clamped),
    b: mixChannel(low.b, high.b, clamped),
  };
  const ratio = 0.25 + clamped * 0.65;
  const r = mixChannel(base.r, target.r, ratio);
  const g = mixChannel(base.g, target.g, ratio);
  const b = mixChannel(base.b, target.b, ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

export function MonthlyTrends() {
  const { habits } = useHabits();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [kindFilter, setKindFilter] = useState<HabitFilter>("all");
  const [habitFilter, setHabitFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const todayKey = getTodayKey();
  const typeFilterDisabled = habitFilter !== "all";

  const filteredHabits = useMemo(() => {
    let list = habits;
    if (habitFilter !== "all") {
      return list.filter((habit) => habit.id === habitFilter);
    }
    if (kindFilter !== "all") {
      list = list.filter((habit) => habit.kind === kindFilter);
    }
    return list;
  }, [habits, habitFilter, kindFilter]);

  useEffect(() => {
    if (habitFilter === "all") {
      return;
    }
    const exists = habits.some((habit) => habit.id === habitFilter);
    if (!exists) {
      setHabitFilter("all");
    }
    if (kindFilter !== "all") {
      setKindFilter("all");
    }
  }, [habitFilter, habits, kindFilter]);

  const days = useMemo(() => getCalendarDays(monthDate, 1), [monthDate]);
  const daySummaries = useMemo(
    () =>
      days.map((day) => ({
        day,
        summary: getDailySummary(filteredHabits, day.key),
      })),
    [days, filteredHabits]
  );

  const monthStats = useMemo(() => {
    let totalEntries = 0;
    let totalSuccess = 0;
    let activeDays = 0;

    for (const { day, summary } of daySummaries) {
      if (!day.inMonth) {
        continue;
      }
      if (summary.total > 0) {
        activeDays += 1;
        totalEntries += summary.total;
        totalSuccess += summary.successes;
      }
    }

    const rate = totalEntries ? Math.round((totalSuccess / totalEntries) * 100) : 0;

    return { totalEntries, totalSuccess, activeDays, rate };
  }, [daySummaries]);

  const filterLabel = useMemo(() => {
    if (habitFilter !== "all") {
      return habits.find((habit) => habit.id === habitFilter)?.title ?? "Selected habit";
    }
    if (kindFilter === "good") {
      return "Good habits";
    }
    if (kindFilter === "bad") {
      return "Bad habits";
    }
    return "All habits";
  }, [habitFilter, habits, kindFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle">
            Monthly trends
          </p>
          <h2 className="mt-2 text-2xl font-[var(--font-display)] font-semibold text-ink">
            {formatMonthLabel(monthDate)}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setMonthDate((current) => addMonths(current, -1))}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setMonthDate(new Date())}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setMonthDate((current) => addMonths(current, 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
        <span className="rounded-[var(--radius-pill)] bg-surface-3 px-3 py-1">
          Active days: {monthStats.activeDays}
        </span>
        <span className="rounded-[var(--radius-pill)] bg-surface-3 px-3 py-1">
          Check-ins: {monthStats.totalEntries}
        </span>
        <span className="rounded-[var(--radius-pill)] bg-surface-3 px-3 py-1">
          Success: {monthStats.rate}%
        </span>
        <span className="rounded-[var(--radius-pill)] bg-surface-3 px-3 py-1">
          Scope: {filterLabel}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px]">
            <label
              htmlFor="habit-filter"
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-subtle"
            >
              Habit
            </label>
            <select
              id="habit-filter"
              className="mt-2 w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 text-xs text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={habitFilter}
              onChange={(event) => setHabitFilter(event.target.value)}
            >
              <option value="all">All habits</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-subtle">
              Type
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={kindFilter === "all" ? "primary" : "secondary"}
                type="button"
                aria-pressed={kindFilter === "all"}
                disabled={typeFilterDisabled}
                onClick={() => setKindFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={kindFilter === "good" ? "primary" : "secondary"}
                type="button"
                aria-pressed={kindFilter === "good"}
                disabled={typeFilterDisabled}
                onClick={() => setKindFilter("good")}
              >
                Good
              </Button>
              <Button
                size="sm"
                variant={kindFilter === "bad" ? "primary" : "secondary"}
                type="button"
                aria-pressed={kindFilter === "bad"}
                disabled={typeFilterDisabled}
                onClick={() => setKindFilter("bad")}
              >
                Bad
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-subtle">
              View
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={viewMode === "cards" ? "primary" : "secondary"}
                type="button"
                aria-pressed={viewMode === "cards"}
                onClick={() => setViewMode("cards")}
              >
                Detail
              </Button>
              <Button
                size="sm"
                variant={viewMode === "heatmap" ? "primary" : "secondary"}
                type="button"
                aria-pressed={viewMode === "heatmap"}
                onClick={() => setViewMode("heatmap")}
              >
                Heatmap
              </Button>
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-ink-subtle">
            {filteredHabits.length} habits selected
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-subtle">
        {WEEKDAYS.map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daySummaries.map(({ day, summary }) => {
          const rate = summary.rate;
          const isToday = day.key === todayKey;
          const tone = summary.total ? getRateTone(rate) : "bg-surface-3";
          const heatColor = summary.total ? getHeatColor(rate) : "var(--color-surface-3)";
          const label = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(day.date);

          if (viewMode === "heatmap") {
            return (
              <div
                key={day.key}
                className={cn(
                  "flex h-12 items-start justify-between rounded-[var(--radius-soft)] border border-border/70 p-2 text-[11px] font-semibold text-ink",
                  !day.inMonth && "text-ink-subtle/70",
                  isToday && "ring-2 ring-accent/40"
                )}
                style={{
                  backgroundColor: heatColor,
                  opacity: day.inMonth ? 1 : 0.55,
                }}
                title={`${label}: ${summary.total ? `${summary.successes}/${summary.total} success` : "No data"}`}
              >
                <span>{day.label}</span>
                {summary.total ? (
                  <span className="text-[10px] text-ink-subtle">{rate}%</span>
                ) : null}
              </div>
            );
          }

          return (
            <div
              key={day.key}
              className={cn(
                "flex h-20 flex-col justify-between rounded-[var(--radius-soft)] border border-border/70 bg-surface/80 p-2 text-xs text-ink-muted",
                !day.inMonth && "bg-surface-3/60 text-ink-subtle/70",
                isToday && "border-accent/70 bg-surface"
              )}
              title={`${label}: ${summary.total ? `${summary.successes}/${summary.total} success` : "No data"}`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
                <span className={cn(!day.inMonth && "text-ink-subtle")}>{day.label}</span>
                {summary.total ? (
                  <span className="text-[10px] text-ink-subtle">
                    {summary.successes}/{summary.total}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-surface-3">
                {summary.total ? (
                  <div className={cn("h-full rounded-full", tone)} style={{ width: `${rate}%` }} />
                ) : null}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
                {summary.total ? `${rate}%` : "No data"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
