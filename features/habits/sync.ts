import { supabase } from "@/lib/supabaseClient";
import type { Habit, HabitEntry, OutboxItem } from "./types";

type HabitRow = {
  id: string;
  user_id: string;
  title: string;
  kind: string;
  review_window_days: number;
  sub_activities: { id: string; label: string }[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type EntryRow = {
  id: string;
  habit_id: string;
  user_id: string;
  entry_date: string;
  status: string;
  sub_activity_statuses: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function isSupabaseReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapHabitToRow(habit: Habit, userId: string): HabitRow {
  return {
    id: habit.id,
    user_id: habit.userId ?? userId,
    title: habit.title,
    kind: habit.kind,
    review_window_days: habit.reviewWindowDays ?? 7,
    sub_activities: habit.subActivities ?? [],
    created_at: habit.createdAt,
    updated_at: habit.updatedAt,
    deleted_at: habit.deletedAt ?? null,
  };
}

function mapEntryToRow(entry: HabitEntry, userId: string): EntryRow {
  return {
    id: entry.id,
    habit_id: entry.habitId,
    user_id: entry.userId ?? userId,
    entry_date: entry.date,
    status: entry.status,
    sub_activity_statuses: entry.subActivityStatuses ?? null,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    deleted_at: entry.deletedAt ?? null,
  };
}

function mapRowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    kind: row.kind as Habit["kind"],
    reviewWindowDays: row.review_window_days ?? 7,
    subActivities: row.sub_activities ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapRowToEntry(row: EntryRow): HabitEntry {
  return {
    id: row.id,
    habitId: row.habit_id,
    userId: row.user_id,
    date: row.entry_date,
    status: row.status as HabitEntry["status"],
    subActivityStatuses: row.sub_activity_statuses ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export async function pushOutbox(items: OutboxItem[], userId: string) {
  if (!isSupabaseReady() || !items.length) {
    return [];
  }

  const processed: string[] = [];

  for (const item of items) {
    if (item.type === "habit") {
      const row = mapHabitToRow(item.payload, userId);
      const { error } = await supabase
        .from("habits")
        .upsert(row, { onConflict: "id" });
      if (!error) {
        processed.push(item.id);
      }
      continue;
    }

    const row = mapEntryToRow(item.payload, userId);
    const { error } = await supabase
      .from("habit_entries")
      .upsert(row, { onConflict: "habit_id,entry_date" });
    if (!error) {
      processed.push(item.id);
    }
  }

  return processed;
}

export async function fetchRemote(userId: string) {
  if (!isSupabaseReady()) {
    return { habits: [], entries: [] };
  }

  const [{ data: habitRows, error: habitError }, { data: entryRows, error: entryError }] =
    await Promise.all([
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("habit_entries").select("*").eq("user_id", userId),
    ]);

  if (habitError || entryError) {
    return { habits: [], entries: [] };
  }

  const habits = (habitRows ?? []).map(mapRowToHabit);
  const entries = (entryRows ?? []).map(mapRowToEntry);

  return { habits, entries };
}
