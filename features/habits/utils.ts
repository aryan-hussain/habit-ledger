import { createId } from "@/lib/id";
import type { Habit, HabitEntry, HabitKind, HabitStatus, HabitWithEntries } from "./types";

export type CalendarDay = {
  key: string;
  date: Date;
  inMonth: boolean;
  label: number;
};

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getTodayKey() {
  return getDateKey(new Date());
}

export function getLastNDays(count: number, baseDate: Date = new Date()) {
  const days: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    days.push(getDateKey(addDays(baseDate, -offset)));
  }
  return days;
}

export function formatDisplayDate(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getCalendarDays(baseDate: Date, weekStartsOn: 0 | 1 = 1) {
  const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const month = baseDate.getMonth();
  const startDay = startOfMonth.getDay();
  const offset = (startDay - weekStartsOn + 7) % 7;
  const gridStart = addDays(startOfMonth, -offset);
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    days.push({
      key: getDateKey(date),
      date,
      inMonth: date.getMonth() === month,
      label: date.getDate(),
    });
  }

  return days;
}

export function createHabit(
  title: string,
  kind: HabitKind,
  reviewWindowDays: number = 7
): Habit {
  const timestamp = new Date().toISOString();
  return {
    id: createId(),
    userId: null,
    title: title.trim(),
    kind,
    reviewWindowDays: Math.max(0, Math.min(90, reviewWindowDays)),
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
}

export function createHabitEntry(
  habitId: string,
  date: string,
  status: HabitStatus
): HabitEntry {
  const timestamp = new Date().toISOString();
  return {
    id: createId(),
    habitId,
    userId: null,
    date,
    status,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
}

export function isDeleted(entity?: { deletedAt?: string | null }) {
  return Boolean(entity?.deletedAt);
}

export function getStatusLabels(kind: HabitKind) {
  return kind === "good"
    ? { success: "Done", fail: "Missed" }
    : { success: "Avoided", fail: "Slipped" };
}

export function getEntryStatus(
  habit: HabitWithEntries,
  dateKey: string
): HabitStatus | null {
  return habit.entries[dateKey]?.status ?? null;
}

export function calculateStreak(habit: HabitWithEntries, baseDate: Date = new Date()) {
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const key = getDateKey(addDays(baseDate, -offset));
    const entry = habit.entries[key];
    if (!entry || entry.status !== "success") {
      break;
    }
    streak += 1;
  }
  return streak;
}

export function calculateSuccessRate(
  habit: HabitWithEntries,
  days: number = 7,
  baseDate: Date = new Date()
) {
  if (days <= 0) {
    return 0;
  }
  const keys = getLastNDays(days, baseDate);
  let successes = 0;

  for (const key of keys) {
    if (habit.entries[key]?.status === "success") {
      successes += 1;
    }
  }

  return Math.round((successes / days) * 100);
}

export function getDailySummary(habits: HabitWithEntries[], dateKey: string) {
  let total = 0;
  let successes = 0;

  for (const habit of habits) {
    const entry = habit.entries[dateKey];
    if (!entry) {
      continue;
    }
    total += 1;
    if (entry.status === "success") {
      successes += 1;
    }
  }

  return {
    total,
    successes,
    rate: total ? Math.round((successes / total) * 100) : 0,
  };
}
