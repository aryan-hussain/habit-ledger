"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { HabitKind } from "../types";
import { useHabits } from "../store";

type HabitFormProps = {
  onSubmitted?: () => void;
};

export function HabitForm({ onSubmitted }: HabitFormProps) {
  const { addHabit } = useHabits();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<HabitKind>("good");
  const [reviewWindowDays, setReviewWindowDays] = useState(7);
  const [subActivities, setSubActivities] = useState("");
  const [errors, setErrors] = useState<{ title?: string; reviewWindowDays?: string }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const nextErrors: { title?: string; reviewWindowDays?: string } = {};
    if (!trimmedTitle) {
      nextErrors.title = "Please enter a habit name.";
    }
    if (reviewWindowDays < 0 || reviewWindowDays > 90) {
      nextErrors.reviewWindowDays = "Review window must be between 0 and 90.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const subActivityLabels = subActivities
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    await addHabit(trimmedTitle, kind, reviewWindowDays, subActivityLabels);
    setTitle("");
    setSubActivities("");
    onSubmitted?.();
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
          onChange={(event) => {
            setTitle(event.target.value);
            if (errors.title) {
              setErrors((current) => ({ ...current, title: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "habit-title-error" : undefined}
        />
        {errors.title ? (
          <p id="habit-title-error" className="mt-2 text-xs text-rust">
            {errors.title}
          </p>
        ) : null}
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
          htmlFor="habit-sub-activities"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle"
        >
          Sub-activities (optional)
        </label>
        <textarea
          id="habit-sub-activities"
          className="mt-2 w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 text-sm text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder={"One per line\nUpper body workout\nLower body workout\nEating bananas"}
          rows={4}
          value={subActivities}
          onChange={(event) => setSubActivities(event.target.value)}
        />
        <p className="mt-2 text-xs text-ink-subtle">
          Check off each sub-activity to complete the habit for the day.
        </p>
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
          min={0}
          max={90}
          className="mt-2 w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 text-sm text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30"
          value={reviewWindowDays}
          onChange={(event) => {
            setReviewWindowDays(
              Number.isNaN(Number(event.target.value))
                ? 7
                : Math.max(0, Math.min(90, Number(event.target.value)))
            );
            if (errors.reviewWindowDays) {
              setErrors((current) => ({ ...current, reviewWindowDays: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.reviewWindowDays)}
          aria-describedby={errors.reviewWindowDays ? "habit-review-window-error" : undefined}
        />
        {errors.reviewWindowDays ? (
          <p id="habit-review-window-error" className="mt-2 text-xs text-rust">
            {errors.reviewWindowDays}
          </p>
        ) : (
          <p className="mt-2 text-xs text-ink-subtle">
            Choose how many days to measure success for this habit.
          </p>
        )}
      </div>
      <Button type="submit" className="w-full">
        Add habit
      </Button>
    </form>
  );
}
