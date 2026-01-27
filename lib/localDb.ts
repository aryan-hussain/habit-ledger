import type { Habit, HabitEntry, OutboxItem } from "@/features/habits/types";

const DB_NAME = "habit-ledger";
const DB_VERSION = 1;
const STORE_HABITS = "habits";
const STORE_ENTRIES = "entries";
const STORE_OUTBOX = "outbox";
const STORE_META = "meta";

type MetaRecord = {
  key: string;
  value: string;
};

function ensureBrowser() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!ensureBrowser()) {
      reject(new Error("IndexedDB unavailable in this environment."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_HABITS)) {
        db.createObjectStore(STORE_HABITS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        db.createObjectStore(STORE_ENTRIES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        db.createObjectStore(STORE_OUTBOX, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

async function withStores(
  storeNames: string[],
  mode: IDBTransactionMode,
  callback: (stores: Record<string, IDBObjectStore>) => void
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames, mode);
    const stores = storeNames.reduce<Record<string, IDBObjectStore>>((acc, name) => {
      acc[name] = transaction.objectStore(name);
      return acc;
    }, {});

    callback(stores);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
  });
}

export async function getHabits(): Promise<Habit[]> {
  try {
    return await withStore(STORE_HABITS, "readonly", (store) => store.getAll());
  } catch {
    return [];
  }
}

export async function getEntries(): Promise<HabitEntry[]> {
  try {
    return await withStore(STORE_ENTRIES, "readonly", (store) => store.getAll());
  } catch {
    return [];
  }
}

export async function upsertHabits(habits: Habit[]) {
  if (!habits.length) {
    return;
  }
  await withStores([STORE_HABITS], "readwrite", ({ habits: store }) => {
    habits.forEach((habit) => store.put(habit));
  });
}

export async function upsertEntries(entries: HabitEntry[]) {
  if (!entries.length) {
    return;
  }
  await withStores([STORE_ENTRIES], "readwrite", ({ entries: store }) => {
    entries.forEach((entry) => store.put(entry));
  });
}

export async function getOutbox(): Promise<OutboxItem[]> {
  try {
    return await withStore(STORE_OUTBOX, "readonly", (store) => store.getAll());
  } catch {
    return [];
  }
}

export async function addOutbox(item: OutboxItem) {
  await withStore(STORE_OUTBOX, "readwrite", (store) => store.put(item));
}

export async function removeOutbox(ids: string[]) {
  if (!ids.length) {
    return;
  }
  await withStores([STORE_OUTBOX], "readwrite", ({ outbox: store }) => {
    ids.forEach((id) => store.delete(id));
  });
}

export async function getMeta(key: string): Promise<string | null> {
  try {
    const record = await withStore<MetaRecord | undefined>(STORE_META, "readonly", (store) =>
      store.get(key)
    );
    return record?.value ?? null;
  } catch {
    return null;
  }
}

export async function setMeta(key: string, value: string) {
  await withStore(STORE_META, "readwrite", (store) => store.put({ key, value }));
}
