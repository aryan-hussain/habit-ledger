export type HabitKind = "good" | "bad";

export type HabitStatus = "success" | "fail";

export type Habit = {
  id: string;
  userId?: string | null;
  title: string;
  kind: HabitKind;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type HabitEntry = {
  id: string;
  habitId: string;
  userId?: string | null;
  date: string;
  status: HabitStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type HabitWithEntries = Habit & {
  entries: Record<string, HabitEntry>;
};

export type OutboxAction = "upsert" | "delete";

export type OutboxItem =
  | {
      id: string;
      type: "habit";
      action: OutboxAction;
      createdAt: string;
      payload: Habit;
      userId?: string | null;
    }
  | {
      id: string;
      type: "entry";
      action: OutboxAction;
      createdAt: string;
      payload: HabitEntry;
      userId?: string | null;
    };
