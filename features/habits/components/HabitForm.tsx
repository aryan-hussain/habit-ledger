"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { HabitKind } from "../types";
import { useHabits } from "../store";

export function HabitForm() {
  const { addHabit } = useHabits();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<HabitKind>("good");
  const [reviewWindowDays, setReviewWindowDays] = useState(7);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void addHabit(title, kind, reviewWindowDays);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="habit-title"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle"
        >
          Add a habit
        </label>
        <input
          id="habit-title"
          className="mt-2 w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 text-sm text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder="Name your habit"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="habit-kind"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle"
        >
          Habit type
        </label>
        <select
          id="habit-kind"
          className="mt-2 w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 text-sm text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30"
          value={kind}
          onChange={(event) => setKind(event.target.value as HabitKind)}
        >
          <option value="good">Good habit</option>
          <option value="bad">Bad habit</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="habit-review-window"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle"
        >
          Review window (days)
        </label>
        <input
          id="habit-review-window"
          type="number"
          min={1}
          max={90}
          className="mt-2 w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 text-sm text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30"
          value={reviewWindowDays}
          onChange={(event) =>
            setReviewWindowDays(
              Number.isNaN(Number(event.target.value))
                ? 7
                : Math.max(1, Math.min(90, Number(event.target.value)))
            )
          }
        />
        <p className="mt-2 text-xs text-ink-subtle">
          Choose how many days to measure success for this habit.
        </p>
      </div>
      <Button type="submit" className="w-full">
        Add habit
      </Button>
    </form>
  );
}
