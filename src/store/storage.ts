import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

/**
 * Единственное место, которое знает, где физически лежат данные.
 * Сейчас: IndexedDB → (если недоступна) localStorage → память.
 * Синхронизацию между устройствами (например Supabase) подключать здесь,
 * остальной код работает только со стором.
 */

const memory = new Map<string, string>();

function hasIndexedDB(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function local(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export const appStorage: StateStorage = {
  async getItem(name) {
    if (hasIndexedDB()) {
      try {
        const value = await get<string>(name);
        if (value !== undefined) return value;
      } catch {
        /* приватный режим и т.п. — пробуем дальше */
      }
    }
    return local()?.getItem(name) ?? memory.get(name) ?? null;
  },
  async setItem(name, value) {
    if (hasIndexedDB()) {
      try {
        await set(name, value);
        return;
      } catch {
        /* пробуем дальше */
      }
    }
    try {
      const ls = local();
      if (ls) {
        ls.setItem(name, value);
        return;
      }
    } catch {
      /* переполнение и т.п. */
    }
    memory.set(name, value);
  },
  async removeItem(name) {
    if (hasIndexedDB()) {
      try {
        await del(name);
      } catch {
        /* ignore */
      }
    }
    local()?.removeItem(name);
    memory.delete(name);
  },
};

/** Просим браузер не вычищать наши данные при нехватке места. Тихо, без ошибок. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persisted && !(await navigator.storage.persisted())) {
      await navigator.storage.persist?.();
    }
  } catch {
    /* не поддерживается — ок */
  }
}
