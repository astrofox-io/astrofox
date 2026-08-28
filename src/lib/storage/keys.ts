/**
 * Storage key constants shared by the storage module, the legacy migration
 * and the plugin store. Kept dependency-free to avoid import cycles.
 */

/** Installed plugins are stored one per key: `astrofox:plugin:<name>`. */
export const PLUGIN_KEY_PREFIX = 'astrofox:plugin:';

/** Pre-SQLite layout: a single JSON blob `{ plugins: Record<name, InstalledPlugin> }`. */
export const LEGACY_PLUGINS_KEY = 'astrofox:plugins';

/** Set once the legacy localStorage data has been imported. Value is an ISO timestamp. */
export const MIGRATION_MARKER_KEY = 'astrofox:meta:migrated-from-localstorage';

/** Keys whose names are unchanged and whose values are copied verbatim. */
export const LEGACY_SIMPLE_KEYS = [
  'astrofox.automatic-updates',
  'astrofox.play-audio-on-load',
  'astrofox.player.volume',
  'astrofox.player.volumeMuted',
  'astrofox.language',
] as const;
