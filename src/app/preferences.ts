const AUTOMATIC_UPDATES_STORAGE_KEY = 'astrofox.automatic-updates';
const PLAY_AUDIO_ON_LOAD_STORAGE_KEY = 'astrofox.play-audio-on-load';

function getBooleanPreference(key: string, defaultValue: boolean): boolean {
  try {
    const value = window.localStorage?.getItem(key);
    return value === null || value === undefined ? defaultValue : value === 'true';
  } catch {
    return defaultValue;
  }
}

function setBooleanPreference(key: string, value: boolean) {
  try {
    window.localStorage?.setItem(key, String(value));
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

/**
 * Whether the app should automatically check for updates on startup.
 * Available updates are always downloaded and installed on quit.
 * Defaults to true.
 */
export function getAutomaticUpdates(): boolean {
  return getBooleanPreference(AUTOMATIC_UPDATES_STORAGE_KEY, true);
}

export function setAutomaticUpdates(enabled: boolean) {
  setBooleanPreference(AUTOMATIC_UPDATES_STORAGE_KEY, enabled);
}

/** Whether audio should start playing when a file is loaded. Defaults to true. */
export function getPlayAudioOnLoad(): boolean {
  return getBooleanPreference(PLAY_AUDIO_ON_LOAD_STORAGE_KEY, true);
}

export function setPlayAudioOnLoad(enabled: boolean) {
  setBooleanPreference(PLAY_AUDIO_ON_LOAD_STORAGE_KEY, enabled);
}
