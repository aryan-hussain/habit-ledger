"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";
import type { HabitWithEntries } from "../types";
import {
  addDays,
  calculateStreak,
  getDateKey,
  getLastNDays,
  parseDateKey,
} from "../utils";
import { StatTile } from "@/components/ui/StatTile";

type HabitAnalyticsProps = {
  habit: HabitWithEntries;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date: Date, weekStartsOn: number = 1) {
  const day = date.getDay();
  const offset = (day - weekStartsOn + 7) % 7;
  return addDays(date, -offset);
}

function getBestStreak(successDates: Set<string>) {
  let best = 0;
  for (const key of successDates) {
    const previous = getDateKey(addDays(parseDateKey(key), -1));
    if (successDates.has(previous)) {
      continue;
    }
    let length = 1;
    let cursor = parseDateKey(key);
    while (successDates.has(getDateKey(addDays(cursor, 1)))) {
      cursor = addDays(cursor, 1);
      length += 1;
    }
    best = Math.max(best, length);
  }
  return best;
}

export function HabitAnalytics({ habit }: HabitAnalyticsProps) {
  const entries = Object.values(habit.entries);
  const totalEntries = entries.length;
  const successEntries = entries.filter((entry) => entry.status === "success");
  const failEntries = entries.filter((entry) => entry.status === "fail");
  const overallRate = totalEntries
    ? Math.round((successEntries.length / totalEntries) * 100)
    : 0;

  const successDates = new Set(successEntries.map((entry) => entry.date));
  const currentStreak = calculateStreak(habit);
  const bestStreak = getBestStreak(successDates);

  const last30Keys = getLastNDays(30);
  const last30Entries = last30Keys.filter((key) => habit.entries[key]);
  const last30Success = last30Keys.filter(
    (key) => habit.entries[key]?.status === "success"
  ).length;
  const last30Rate = last30Entries.length
    ? Math.round((last30Success / last30Entries.length) * 100)
    : 0;

  const weekdayCounts = successEntries.reduce<Record<string, number>>((acc, entry) => {
    const weekday = WEEKDAY_LABELS[parseDateKey(entry.date).getDay()] ?? "—";
    acc[weekday] = (acc[weekday] ?? 0) + 1;
    return acc;
  }, {});
  const bestDay = Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const chartData = (() => {
    const today = new Date();
    const anchor = startOfWeek(today, 1);
    const entryDates = entries.map((entry) => ({
      status: entry.status,
      time: parseDateKey(entry.date).getTime(),
    }));
    const weeks = 12;
    const data = [];
    for (let index = weeks - 1; index >= 0; index -= 1) {
      const start = addDays(anchor, -index * 7);
      const end = addDays(start, 6);
      const startTime = start.getTime();
      const endTime = end.getTime();
      const weekEntries = entryDates.filter(
        (item) => item.time >= startTime && item.time <= endTime
      );
      const checkIns = weekEntries.length;
      const successCount = weekEntries.filter((item) => item.status === "success").length;
      const successRate = checkIns ? Math.round((successCount / checkIns) * 100) : 0;

      data.push({
        label: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(start),
        checkIns,
        successRate,
      });
    }
    return data;
  })();

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-subtle sm:text-xs sm:tracking-[0.3em]">
          Habit analytics
        </p>
        <h3 className="mt-1.5 text-xl font-[var(--font-display)] font-semibold text-ink sm:text-2xl">
          Progress insights
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          className="p-3 sm:p-4"
          label="Check-ins"
          value={`${totalEntries}`}
          hint={`${successEntries.length} success / ${failEntries.length} missed`}
        />
        <StatTile
          className="p-3 sm:p-4"
          label="Overall success"
          value={`${overallRate}%`}
          hint="All time"
        />
        <StatTile
          className="p-3 sm:p-4"
          label="Current streak"
          value={`${currentStreak} days`}
          hint="Right now"
        />
        <StatTile
          className="p-3 sm:p-4"
          label="Best streak"
          value={`${bestStreak} days`}
          hint={`Best day: ${bestDay}`}
        />
      </div>

      <div className="rounded-[var(--radius-soft)] border border-border bg-surface/80 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-subtle sm:text-[11px] sm:tracking-[0.3em]">
              Last 30 days
            </p>
            <p className="text-[12px] text-ink-muted sm:text-sm">
              {last30Entries.length} check-ins · {last30Rate}% success
            </p>
          </div>
          <div className="text-[11px] text-ink-subtle sm:text-xs">
            Green = success, Red = missed, Neutral = no entry
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[repeat(30,minmax(0,1fr))] gap-0.5 sm:mt-4 sm:gap-1">
          {last30Keys.map((key) => {
            const status = habit.entries[key]?.status;
            return (
              <div
                key={key}
                className={cn(
                  "h-2 rounded-[6px] sm:h-3",
                  status === "success"
                    ? "bg-olive"
                    : status === "fail"
                      ? "bg-rust"
                      : "bg-surface-3"
                )}
                title={`${key}: ${status ?? "No entry"}`}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-[var(--radius-soft)] border border-border bg-surface/80 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-subtle sm:text-[11px] sm:tracking-[0.3em]">
              12-week trend
            </p>
            <p className="text-[12px] text-ink-muted sm:text-sm">
              Bars show check-ins, line shows success rate.
            </p>
          </div>
          <div className="text-[11px] text-ink-subtle sm:text-xs">
            Success rate is 0–100%
          </div>
        </div>
        <div className="mt-3 h-48 sm:mt-4 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                cursor={{ stroke: "rgba(0,0,0,0.1)" }}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "rgba(0,0,0,0.12)",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="checkIns"
                fill="var(--color-sky)"
                radius={[6, 6, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke="var(--color-olive)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
