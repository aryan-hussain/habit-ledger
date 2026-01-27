"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { addOutbox, getEntries, getHabits, getMeta, getOutbox, removeOutbox, setMeta, upsertEntries, upsertHabits } from "@/lib/localDb";
import { supabase } from "@/lib/supabaseClient";
import type { Habit, HabitEntry, HabitKind, HabitStatus, HabitWithEntries, OutboxItem } from "./types";
import { createHabit, createHabitEntry, isDeleted } from "./utils";
import { fetchRemote, pushOutbox } from "./sync";

type HabitsContextValue = {
  habits: HabitWithEntries[];
  isSyncing: boolean;
  lastSync: string | null;
  userId: string | null;
  addHabit: (title: string, kind: HabitKind) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  setHabitStatus: (id: string, date: string, status: HabitStatus) => Promise<void>;
  clearHabitStatus: (id: string, date: string) => Promise<void>;
  syncNow: () => Promise<void>;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

const supabaseReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function buildHabitsWithEntries(
  habits: Habit[],
  entries: HabitEntry[],
  activeUserId: string | null
): HabitWithEntries[] {
  const entryMap = new Map<string, Record<string, HabitEntry>>();
  for (const entry of entries) {
    if (isDeleted(entry)) {
      continue;
    }
    if (activeUserId && entry.userId && entry.userId !== activeUserId) {
      continue;
    }
    if (!activeUserId && entry.userId) {
      continue;
    }
    const habitEntries = entryMap.get(entry.habitId) ?? {};
    habitEntries[entry.date] = entry;
    entryMap.set(entry.habitId, habitEntries);
  }

  return habits
    .filter((habit) => !isDeleted(habit))
    .filter((habit) => {
      if (activeUserId && habit.userId && habit.userId !== activeUserId) {
        return false;
      }
      if (!activeUserId && habit.userId) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((habit) => ({
      ...habit,
      entries: entryMap.get(habit.id) ?? {},
    }));
}

function getEntryKey(entry: HabitEntry) {
  return `${entry.habitId}::${entry.date}`;
}

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<HabitWithEntries[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const habitsRef = useRef<Habit[]>([]);
  const entriesRef = useRef<HabitEntry[]>([]);
  const syncingRef = useRef(false);

  const updateState = useCallback(
    (nextHabits: Habit[], nextEntries: HabitEntry[], activeUserId: string | null = userId) => {
      habitsRef.current = nextHabits;
      entriesRef.current = nextEntries;
      setHabits(buildHabitsWithEntries(nextHabits, nextEntries, activeUserId));
    },
    [userId]
  );

  const hydrateLocal = useCallback(async () => {
    const [storedHabits, storedEntries, storedSync] = await Promise.all([
      getHabits(),
      getEntries(),
      getMeta("lastSync"),
    ]);
    updateState(storedHabits, storedEntries, userId);
    setLastSync(storedSync);
  }, [updateState, userId]);

  useEffect(() => {
    hydrateLocal();
  }, [hydrateLocal]);

  useEffect(() => {
    updateState(habitsRef.current, entriesRef.current, userId);
  }, [updateState, userId]);

  const attachLocalUser = useCallback(
    async (activeUserId: string) => {
      const updatedHabits: Habit[] = [];
      const nextHabits = habitsRef.current.map((habit) => {
        if (habit.userId) {
          return habit;
        }
        const updated = { ...habit, userId: activeUserId };
        updatedHabits.push(updated);
        return updated;
      });

      const updatedEntries: HabitEntry[] = [];
      const nextEntries = entriesRef.current.map((entry) => {
        if (entry.userId) {
          return entry;
        }
        const updated = { ...entry, userId: activeUserId };
        updatedEntries.push(updated);
        return updated;
      });

      if (updatedHabits.length) {
        await upsertHabits(updatedHabits);
      }
      if (updatedEntries.length) {
        await upsertEntries(updatedEntries);
      }
      updateState(nextHabits, nextEntries, activeUserId);
    },
    [updateState]
  );

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        attachLocalUser(data.user.id).then(syncNow);
      }
    });
  }, [attachLocalUser, syncNow]);

  const mergeRemote = useCallback(
    async (remoteHabits: Habit[], remoteEntries: HabitEntry[], outbox: OutboxItem[]) => {
      const localHabits = habitsRef.current;
      const localEntries = entriesRef.current;
      const outboxHabitIds = new Set(
        outbox.filter((item) => item.type === "habit").map((item) => item.payload.id)
      );
      const outboxEntryKeys = new Set(
        outbox
          .filter((item) => item.type === "entry")
          .map((item) => getEntryKey(item.payload))
      );

      const habitMap = new Map(localHabits.map((habit) => [habit.id, habit]));
      const entryMap = new Map(localEntries.map((entry) => [getEntryKey(entry), entry]));

      const habitsToUpsert: Habit[] = [];
      for (const remote of remoteHabits) {
        if (outboxHabitIds.has(remote.id)) {
          continue;
        }
        const local = habitMap.get(remote.id);
        if (!local || remote.updatedAt > local.updatedAt) {
          habitsToUpsert.push(remote);
        }
      }

      const entriesToUpsert: HabitEntry[] = [];
      for (const remote of remoteEntries) {
        const key = getEntryKey(remote);
        if (outboxEntryKeys.has(key)) {
          continue;
        }
        const local = entryMap.get(key);
        if (!local || remote.updatedAt > local.updatedAt) {
          entriesToUpsert.push(remote);
        }
      }

      if (habitsToUpsert.length) {
        await upsertHabits(habitsToUpsert);
      }
      if (entriesToUpsert.length) {
        await upsertEntries(entriesToUpsert);
      }
      if (habitsToUpsert.length || entriesToUpsert.length) {
        const mergedHabits = [
          ...localHabits.filter((habit) => !habitsToUpsert.find((r) => r.id === habit.id)),
          ...habitsToUpsert,
        ];
        const mergedEntries = [
          ...localEntries.filter(
            (entry) => !entriesToUpsert.find((r) => getEntryKey(r) === getEntryKey(entry))
          ),
          ...entriesToUpsert,
        ];
        updateState(mergedHabits, mergedEntries);
      }
    },
    [updateState]
  );

  const syncNow = useCallback(async () => {
    if (syncingRef.current) {
      return;
    }
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      if (!supabaseReady) {
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        return;
      }

      setUserId(user.id);
      const outbox = await getOutbox();
      const processed = await pushOutbox(outbox, user.id);
      if (processed.length) {
        await removeOutbox(processed);
      }

      const { habits: remoteHabits, entries: remoteEntries } = await fetchRemote(user.id);
      const remainingOutbox = processed.length
        ? outbox.filter((item) => !processed.includes(item.id))
        : outbox;
      await mergeRemote(remoteHabits, remoteEntries, remainingOutbox);

      const stamp = new Date().toISOString();
      await setMeta("lastSync", stamp);
      setLastSync(stamp);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [mergeRemote]);

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      if (session?.user) {
        attachLocalUser(session.user.id).then(syncNow);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [attachLocalUser, syncNow]);

  const addHabit = useCallback(
    async (title: string, kind: HabitKind) => {
      const trimmed = title.trim();
      if (!trimmed) {
        return;
      }
      const habit = createHabit(trimmed, kind);
      habit.userId = userId;
      const nextHabits = [habit, ...habitsRef.current];
      const nextEntries = entriesRef.current;
      updateState(nextHabits, nextEntries);
      await upsertHabits([habit]);
      await addOutbox({
        id: habit.id,
        type: "habit",
        action: "upsert",
        createdAt: habit.updatedAt,
        payload: habit,
        userId,
      });
    },
    [updateState, userId]
  );

  const removeHabit = useCallback(
    async (id: string) => {
      const nextHabits = habitsRef.current.map((habit) => {
        if (habit.id !== id) {
          return habit;
        }
        const timestamp = new Date().toISOString();
        return {
          ...habit,
          deletedAt: timestamp,
          updatedAt: timestamp,
          userId,
        };
      });
      updateState(nextHabits, entriesRef.current);
      const deletedHabit = nextHabits.find((habit) => habit.id === id);
      if (deletedHabit) {
        await upsertHabits([deletedHabit]);
        await addOutbox({
          id: deletedHabit.id,
          type: "habit",
          action: "delete",
          createdAt: deletedHabit.updatedAt,
          payload: deletedHabit,
          userId,
        });
      }
    },
    [updateState, userId]
  );

  const setHabitStatus = useCallback(
    async (id: string, date: string, status: HabitStatus) => {
      const timestamp = new Date().toISOString();
      const existingEntry = entriesRef.current.find(
        (entry) => entry.habitId === id && entry.date === date
      );

      const entry = existingEntry
        ? {
            ...existingEntry,
            status,
            updatedAt: timestamp,
            deletedAt: null,
            userId,
          }
        : createHabitEntry(id, date, status);

      if (!existingEntry) {
        entry.updatedAt = timestamp;
      }

      entry.userId = userId;

      const nextEntries = existingEntry
        ? entriesRef.current.map((current) => (current.id === entry.id ? entry : current))
        : [entry, ...entriesRef.current];

      const nextHabits = habitsRef.current.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              updatedAt: timestamp,
              userId,
            }
          : habit
      );

      updateState(nextHabits, nextEntries);
      await upsertEntries([entry]);
      const updatedHabit = nextHabits.find((habit) => habit.id === id);
      if (updatedHabit) {
        await upsertHabits([updatedHabit]);
        await addOutbox({
          id: updatedHabit.id,
          type: "habit",
          action: "upsert",
          createdAt: updatedHabit.updatedAt,
          payload: updatedHabit,
          userId,
        });
      }
      await addOutbox({
        id: entry.id,
        type: "entry",
        action: "upsert",
        createdAt: entry.updatedAt,
        payload: entry,
        userId,
      });
    },
    [updateState, userId]
  );

  const clearHabitStatus = useCallback(
    async (id: string, date: string) => {
      const existingEntry = entriesRef.current.find(
        (entry) => entry.habitId === id && entry.date === date
      );
      if (!existingEntry) {
        return;
      }
      const timestamp = new Date().toISOString();
      const entry: HabitEntry = {
        ...existingEntry,
        deletedAt: timestamp,
        updatedAt: timestamp,
        userId,
      };

      const nextEntries = entriesRef.current.map((current) =>
        current.id === entry.id ? entry : current
      );
      const nextHabits = habitsRef.current.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              updatedAt: timestamp,
              userId,
            }
          : habit
      );
      updateState(nextHabits, nextEntries);
      await upsertEntries([entry]);
      const updatedHabit = nextHabits.find((habit) => habit.id === id);
      if (updatedHabit) {
        await upsertHabits([updatedHabit]);
        await addOutbox({
          id: updatedHabit.id,
          type: "habit",
          action: "upsert",
          createdAt: updatedHabit.updatedAt,
          payload: updatedHabit,
          userId,
        });
      }
      await addOutbox({
        id: entry.id,
        type: "entry",
        action: "delete",
        createdAt: entry.updatedAt,
        payload: entry,
        userId,
      });
    },
    [updateState, userId]
  );

  useEffect(() => {
    const handleOnline = () => {
      syncNow();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncNow]);

  const value = useMemo(
    () => ({
      habits,
      isSyncing,
      lastSync,
      userId,
      addHabit,
      removeHabit,
      setHabitStatus,
      clearHabitStatus,
      syncNow,
    }),
    [
      habits,
      isSyncing,
      lastSync,
      userId,
      addHabit,
      removeHabit,
      setHabitStatus,
      clearHabitStatus,
      syncNow,
    ]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within HabitsProvider.");
  }
  return context;
}
