import type { InstalledModule } from './types';

const STORAGE_KEY = 'astrofox:modules';

interface StoreData {
  modules: Record<string, InstalledModule>;
}

function readStore(): StoreData {
  if (typeof window === 'undefined') {
    return { modules: {} };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { modules: {} };
    }

    const data = JSON.parse(raw) as StoreData;
    if (!data || typeof data.modules !== 'object' || data.modules === null) {
      return { modules: {} };
    }
    return data;
  } catch {
    return { modules: {} };
  }
}

function writeStore(data: StoreData) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getInstalledModules(): Record<string, InstalledModule> {
  return readStore().modules;
}

export function getInstalledModule(name: string): InstalledModule | null {
  return readStore().modules[name] ?? null;
}

export function saveInstalledModule(module: InstalledModule) {
  const data = readStore();
  data.modules[module.manifest.name] = module;
  writeStore(data);
}

export function removeInstalledModule(name: string) {
  const data = readStore();
  delete data.modules[name];
  writeStore(data);
}
