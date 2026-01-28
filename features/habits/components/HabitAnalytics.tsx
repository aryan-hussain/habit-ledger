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
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle">
          Habit analytics
        </p>
        <h3 className="mt-2 text-2xl font-[var(--font-display)] font-semibold text-ink">
          Progress insights
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Check-ins"
          value={`${totalEntries}`}
          hint={`${successEntries.length} success / ${failEntries.length} missed`}
        />
        <StatTile label="Overall success" value={`${overallRate}%`} hint="All time" />
        <StatTile label="Current streak" value={`${currentStreak} days`} hint="Right now" />
        <StatTile label="Best streak" value={`${bestStreak} days`} hint={`Best day: ${bestDay}`} />
      </div>

      <div className="rounded-[var(--radius-soft)] border border-border bg-surface/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-subtle">
              Last 30 days
            </p>
            <p className="text-sm text-ink-muted">
              {last30Entries.length} check-ins · {last30Rate}% success
            </p>
          </div>
          <div className="text-xs text-ink-subtle">
            Green = success, Red = missed, Neutral = no entry
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
          {last30Keys.map((key) => {
            const status = habit.entries[key]?.status;
            return (
              <div
                key={key}
                className={cn(
                  "h-3 rounded-[6px]",
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

      <div className="rounded-[var(--radius-soft)] border border-border bg-surface/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-subtle">
              12-week trend
            </p>
            <p className="text-sm text-ink-muted">
              Bars show check-ins, line shows success rate.
            </p>
          </div>
          <div className="text-xs text-ink-subtle">Success rate is 0–100%</div>
        </div>
        <div className="mt-4 h-64">
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
