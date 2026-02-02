import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const AUTH_DB_NAME = "habit-ledger-auth";
const AUTH_STORE_NAME = "supabase-auth";
const AUTH_DB_VERSION = 1;

function getBrowserLocalStorage(): Storage | null {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return null;
  }
  try {
    const key = "__auth_storage_test__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return window.localStorage;
  } catch {
    return null;
  }
}

function openAuthDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const request = indexedDB.open(AUTH_DB_NAME, AUTH_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AUTH_STORE_NAME)) {
        db.createObjectStore(AUTH_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open auth DB"));
  });
}

const memoryStorage = (() => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
})();

const idbStorage = {
  async getItem(key: string) {
    try {
      const db = await openAuthDb();
      return await new Promise<string | null>((resolve) => {
        const transaction = db.transaction(AUTH_STORE_NAME, "readonly");
        const store = transaction.objectStore(AUTH_STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve((request.result as string | undefined) ?? null);
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      const db = await openAuthDb();
      await new Promise<void>((resolve) => {
        const transaction = db.transaction(AUTH_STORE_NAME, "readwrite");
        const store = transaction.objectStore(AUTH_STORE_NAME);
        store.put(value, key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
    } catch {
      return;
    }
  },
  async removeItem(key: string) {
    try {
      const db = await openAuthDb();
      await new Promise<void>((resolve) => {
        const transaction = db.transaction(AUTH_STORE_NAME, "readwrite");
        const store = transaction.objectStore(AUTH_STORE_NAME);
        store.delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
    } catch {
      return;
    }
  },
};

const authStorage = (() => {
  const local = getBrowserLocalStorage();
  if (local) {
    return {
      getItem: (key: string) => local.getItem(key),
      setItem: (key: string, value: string) => local.setItem(key, value),
      removeItem: (key: string) => local.removeItem(key),
    };
  }

  if (typeof indexedDB !== "undefined") {
    return idbStorage;
  }

  return memoryStorage;
})();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: authStorage,
  },
});
