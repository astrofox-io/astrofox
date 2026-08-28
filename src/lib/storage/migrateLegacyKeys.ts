import {
  LEGACY_PLUGINS_KEY,
  LEGACY_SIMPLE_KEYS,
  MIGRATION_MARKER_KEY,
  PLUGIN_KEY_PREFIX,
} from './keys';

/** Minimal synchronous string store, implemented by desktop, localStorage and memory backends. */
export interface StorageBackend {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  keys: () => string[];
}

/**
 * One-time import of data written by earlier versions directly to
 * `window.localStorage`. Idempotent: guarded by a marker in `target`, never
 * overwrites values already present in `target`, and only removes legacy
 * keys from `source` after the marker is written so a crash mid-way is safe.
 *
 * Also runs on the web build (where `source` is `target`) because the plugin
 * layout changed from a single blob to one key per plugin.
 */
export function migrateLegacyKeys(
  target: StorageBackend,
  source: Storage | null,
  sourceIsTarget: boolean,
) {
  if (target.get(MIGRATION_MARKER_KEY) !== null) {
    return;
  }

  if (source) {
    if (!sourceIsTarget) {
      for (const key of LEGACY_SIMPLE_KEYS) {
        const value = source.getItem(key);
        if (value !== null && target.get(key) === null) {
          target.set(key, value);
        }
      }
    }

    const raw = source.getItem(LEGACY_PLUGINS_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw) as { plugins?: Record<string, unknown> } | null;
        const plugins = data?.plugins;
        if (plugins && typeof plugins === 'object') {
          for (const [name, plugin] of Object.entries(plugins)) {
            const key = PLUGIN_KEY_PREFIX + name;
            if (plugin && target.get(key) === null) {
              target.set(key, JSON.stringify(plugin));
            }
          }
        }
      } catch {
        // Unparsable legacy blob: nothing worth keeping.
      }
    }
  }

  target.set(MIGRATION_MARKER_KEY, new Date().toISOString());

  if (source) {
    try {
      source.removeItem(LEGACY_PLUGINS_KEY);
      if (!sourceIsTarget) {
        for (const key of LEGACY_SIMPLE_KEYS) {
          source.removeItem(key);
        }
      }
    } catch {
      // Leaving stale keys behind is harmless; the marker prevents re-import.
    }
  }
}
