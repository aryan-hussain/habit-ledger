"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { HabitKind } from "../types";
import { useHabits } from "../store";

export function HabitForm() {
  const { addHabit } = useHabits();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<HabitKind>("good");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void addHabit(title, kind);
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
      <Button type="submit" className="w-full">
        Add habit
      </Button>
    </form>
  );
}
