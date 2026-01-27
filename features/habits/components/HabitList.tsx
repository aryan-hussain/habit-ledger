import type { HabitWithEntries } from "../types";
import { HabitCard } from "./HabitCard";

type HabitListProps = {
  title: string;
  description: string;
  habits: HabitWithEntries[];
  emptyCopy: string;
};

export function HabitList({ title, description, habits, emptyCopy }: HabitListProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle">
          {title}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">{description}</h2>
      </div>
      <div className="space-y-3">
        {habits.length ? (
          habits.map((habit) => <HabitCard key={habit.id} habit={habit} />)
        ) : (
          <div className="rounded-[var(--radius-soft)] border border-dashed border-border bg-surface-2 p-6 text-sm text-ink-muted">
            {emptyCopy}
          </div>
        )}
      </div>
    </section>
  );
}
