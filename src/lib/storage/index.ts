import { getDesktopBridge } from '@/app/desktop';
import { migrateLegacyKeys, type StorageBackend } from './migrateLegacyKeys';

export * from './keys';

let backend: StorageBackend | null = null;
let desktopStorage = false;

function getLocalStorage(): Storage | null {
  try {
    const store = window.localStorage;
    if (!store) return null;
    const probe = '__astrofox_storage_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

function createLocalStorageBackend(store: Storage): StorageBackend {
  return {
    get: key => store.getItem(key),
    set: (key, value) => store.setItem(key, value),
    remove: key => store.removeItem(key),
    keys: () => {
      const result: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key !== null) result.push(key);
      }
      return result;
    },
  };
}

function createMemoryBackend(): StorageBackend {
  const map = new Map<string, string>();
  return {
    get: key => map.get(key) ?? null,
    set: (key, value) => {
      map.set(key, value);
    },
    remove: key => {
      map.delete(key);
    },
    keys: () => Array.from(map.keys()),
  };
}

/**
 * Picks the backend on first use: desktop SQLite bridge, then localStorage,
 * then memory (SSR / storage disabled). The legacy localStorage import runs
 * here so it always precedes the first read.
 */
function resolveBackend(): StorageBackend {
  if (backend) return backend;

  if (typeof window === 'undefined') {
    return createMemoryBackend();
  }

  const bridge = getDesktopBridge()?.storage;
  const local = getLocalStorage();

  if (bridge) {
    backend = {
      get: key => bridge.get(key),
      set: (key, value) => bridge.set(key, value),
      remove: key => bridge.remove(key),
      keys: () => bridge.keys(),
    };
    desktopStorage = true;
    safeMigrate(backend, local, false);
  } else if (local) {
    backend = createLocalStorageBackend(local);
    safeMigrate(backend, local, true);
  } else {
    backend = createMemoryBackend();
  }

  return backend;
}

function safeMigrate(target: StorageBackend, source: Storage | null, sourceIsTarget: boolean) {
  try {
    migrateLegacyKeys(target, source, sourceIsTarget);
  } catch (error) {
    console.warn('[storage] Legacy migration failed:', error);
  }
}

/** True when persistence goes through the desktop SQLite bridge. */
export function isDesktopStorage(): boolean {
  resolveBackend();
  return desktopStorage;
}

export function getItem(key: string): string | null {
  try {
    return resolveBackend().get(key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  try {
    resolveBackend().set(key, value);
  } catch (error) {
    console.warn(`[storage] Failed to write "${key}":`, error);
  }
}

export function removeItem(key: string): void {
  try {
    resolveBackend().remove(key);
  } catch (error) {
    console.warn(`[storage] Failed to remove "${key}":`, error);
  }
}

export function keys(prefix?: string): string[] {
  try {
    const all = resolveBackend().keys();
    return prefix ? all.filter(key => key.startsWith(prefix)) : all;
  } catch {
    return [];
  }
}

export function getBoolean(key: string, fallback: boolean): boolean {
  const value = getItem(key);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export function setBoolean(key: string, value: boolean): void {
  setItem(key, String(value));
}

export function getNumber(key: string, fallback: number): number {
  const value = getItem(key);
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function setNumber(key: string, value: number): void {
  setItem(key, String(value));
}

export function getJSON<T>(key: string, fallback: T): T {
  const value = getItem(key);
  if (value === null) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function setJSON(key: string, value: unknown): void {
  setItem(key, JSON.stringify(value));
}
