import type { InstalledPlugin } from './types';

const STORAGE_KEY = 'astrofox:plugins';

interface StoreData {
  plugins: Record<string, InstalledPlugin>;
}

function readStore(): StoreData {
  if (typeof window === 'undefined') {
    return { plugins: {} };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { plugins: {} };
    }

    const data = JSON.parse(raw) as StoreData;
    if (!data || typeof data.plugins !== 'object' || data.plugins === null) {
      return { plugins: {} };
    }
    return data;
  } catch {
    return { plugins: {} };
  }
}

function writeStore(data: StoreData) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getInstalledPlugins(): Record<string, InstalledPlugin> {
  return readStore().plugins;
}

export function getInstalledPlugin(name: string): InstalledPlugin | null {
  return readStore().plugins[name] ?? null;
}

export function saveInstalledPlugin(plugin: InstalledPlugin) {
  const data = readStore();
  data.plugins[plugin.manifest.name] = plugin;
  writeStore(data);
}

export function removeInstalledPlugin(name: string) {
  const data = readStore();
  delete data.plugins[name];
  writeStore(data);
}
