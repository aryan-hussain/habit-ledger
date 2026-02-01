"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { HabitWithEntries } from "../types";
import {
  addDays,
  addMonths,
  formatMonthLabel,
  getCalendarDays,
  getDateKey,
  getTodayKey,
  getStatusLabels,
  parseDateKey,
} from "../utils";
import { useHabits } from "../store";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type IconProps = React.SVGProps<SVGSVGElement>;

function IconCheck(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12l4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconX(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
    </svg>
  );
}

function IconUndo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 7H5v4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 11c1.6-3.2 5-5 8.8-4.2 3.7.8 6.2 4.2 5.6 8-0.5 3.2-3.2 5.4-6.4 5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type HabitCalendarProps = {
  habit: HabitWithEntries;
};

export function HabitCalendar({ habit }: HabitCalendarProps) {
  const { setHabitStatus, clearHabitStatus } = useHabits();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const todayKey = getTodayKey();
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const labels = getStatusLabels(habit.kind);
  const reviewWindowDays = habit.reviewWindowDays || 7;
  const habitStart = useMemo(
    () => parseDateKey(getDateKey(new Date(habit.createdAt))),
    [habit.createdAt]
  );
  const habitEnd = useMemo(
    () => addDays(habitStart, Math.max(0, reviewWindowDays - 1)),
    [habitStart, reviewWindowDays]
  );
  const habitStartKey = useMemo(() => getDateKey(habitStart), [habitStart]);
  const habitEndKey = useMemo(() => getDateKey(habitEnd), [habitEnd]);

  const days = useMemo(() => getCalendarDays(monthDate, 1), [monthDate]);
  const selectedEntry = habit.entries[selectedKey];
  const selectedLabel = useMemo(() => {
    const [year, month, day] = selectedKey.split("-").map(Number);
    const selectedDate = new Date(year, (month ?? 1) - 1, day ?? 1);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(selectedDate);
  }, [selectedKey]);

  const clampToRange = useCallback(
    (key: string) => {
      const date = parseDateKey(key);
      if (date < habitStart) {
        return habitStartKey;
      }
      return key;
    },
    [habitStart, habitStartKey]
  );

  useEffect(() => {
    setSelectedKey((current) => clampToRange(current));
  }, [clampToRange]);

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-ink-subtle sm:text-[11px] sm:tracking-[0.3em]">
            Calendar check-ins
          </p>
          <h4 className="mt-1 text-base font-[var(--font-display)] font-semibold text-ink sm:mt-2 sm:text-lg">
            {formatMonthLabel(monthDate)}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
            onClick={() => setMonthDate((current) => addMonths(current, -1))}
            aria-label="Previous month"
          >
            <IconChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
            onClick={() => {
              const today = new Date();
              setMonthDate(today);
              setSelectedKey(clampToRange(getDateKey(today)));
            }}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
            onClick={() => setMonthDate((current) => addMonths(current, 1))}
            aria-label="Next month"
          >
            <IconChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-subtle sm:gap-2 sm:text-[11px] sm:tracking-[0.2em]">
        {WEEKDAYS.map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const entry = habit.entries[day.key];
          const status = entry?.status;
          const isToday = day.key === todayKey;
          const isSelected = day.key === selectedKey;
          const isBeforeStart = day.date < habitStart;
          const isSelectable = day.inMonth && !isBeforeStart;
          const isReviewCompletionDay = day.key === habitEndKey;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => isSelectable && setSelectedKey(day.key)}
              className={cn(
                "flex h-12 flex-col items-center justify-center rounded-[var(--radius-soft)] border border-border/70 bg-surface/80 text-[10px] font-semibold text-ink transition hover:border-accent/60 sm:h-12 sm:text-xs",
                !day.inMonth && "bg-surface-3/60 text-ink-subtle/70",
                isBeforeStart && "cursor-not-allowed bg-surface-3/40 text-ink-subtle/60",
                isToday && "ring-2 ring-accent/30",
                isReviewCompletionDay && "border-olive/70 bg-surface ring-2 ring-olive/30",
                isSelected && "border-accent bg-surface ring-2 ring-accent/60"
              )}
              title={
                isSelectable
                  ? `${day.key}: ${status ?? "No entry"}`
                  : `Unavailable - before ${habitStartKey}`
              }
              aria-pressed={isSelected}
              disabled={!isSelectable}
            >
              <span>{day.label}</span>
              <span
                className={cn(
                  "mt-0.5 h-1 w-5 rounded-full sm:mt-1 sm:h-1.5 sm:w-6",
                  status === "success"
                    ? "bg-olive"
                    : status === "fail"
                      ? "bg-rust"
                      : "bg-surface-3"
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-soft)] border border-dashed border-border bg-surface-2 px-3 py-2 text-xs text-ink-muted sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-subtle sm:text-xs sm:tracking-[0.2em]">
          {selectedLabel}
        </span>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button
            size="sm"
            variant={selectedEntry?.status === "success" ? "primary" : "secondary"}
            type="button"
            className="h-8 px-2 sm:h-9 sm:px-3"
            onClick={() => void setHabitStatus(habit.id, selectedKey, "success")}
            aria-label={`Mark as ${labels.success}`}
            title={`Mark as ${labels.success}`}
          >
            <IconCheck className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant={selectedEntry?.status === "fail" ? "primary" : "secondary"}
            type="button"
            className="h-8 px-2 sm:h-9 sm:px-3"
            onClick={() => void setHabitStatus(habit.id, selectedKey, "fail")}
            aria-label={`Mark as ${labels.fail}`}
            title={`Mark as ${labels.fail}`}
          >
            <IconX className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8 px-2 sm:h-9 sm:px-3"
            onClick={() => void clearHabitStatus(habit.id, selectedKey)}
            aria-label="Unmark day"
            title="Unmark day"
          >
            <IconUndo className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
