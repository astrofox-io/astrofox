import { getJSON, keys, PLUGIN_KEY_PREFIX, removeItem, setJSON } from '@/lib/storage';
import type { InstalledPlugin } from './types';

function pluginKey(name: string) {
  return PLUGIN_KEY_PREFIX + name;
}

function isInstalledPlugin(value: unknown): value is InstalledPlugin {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as InstalledPlugin).manifest === 'object' &&
    (value as InstalledPlugin).manifest !== null
  );
}

export function getInstalledPlugins(): Record<string, InstalledPlugin> {
  const plugins: Record<string, InstalledPlugin> = {};

  for (const key of keys(PLUGIN_KEY_PREFIX)) {
    const plugin = getJSON<unknown>(key, null);
    if (isInstalledPlugin(plugin)) {
      plugins[key.slice(PLUGIN_KEY_PREFIX.length)] = plugin;
    }
  }

  return plugins;
}

export function getInstalledPlugin(name: string): InstalledPlugin | null {
  const plugin = getJSON<unknown>(pluginKey(name), null);
  return isInstalledPlugin(plugin) ? plugin : null;
}

export function saveInstalledPlugin(plugin: InstalledPlugin) {
  setJSON(pluginKey(plugin.manifest.name), plugin);
}

export function removeInstalledPlugin(name: string) {
  removeItem(pluginKey(name));
}
