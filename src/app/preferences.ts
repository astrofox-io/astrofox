import { getBoolean, setBoolean } from '@/lib/storage';

const AUTOMATIC_UPDATES_STORAGE_KEY = 'astrofox.automatic-updates';
const PLAY_AUDIO_ON_LOAD_STORAGE_KEY = 'astrofox.play-audio-on-load';

/**
 * Whether the app should automatically check for updates on startup.
 * Available updates are always downloaded and installed on quit.
 * Defaults to true.
 */
export function getAutomaticUpdates(): boolean {
  return getBoolean(AUTOMATIC_UPDATES_STORAGE_KEY, true);
}

export function setAutomaticUpdates(enabled: boolean) {
  setBoolean(AUTOMATIC_UPDATES_STORAGE_KEY, enabled);
}

/** Whether audio should start playing when a file is loaded. Defaults to true. */
export function getPlayAudioOnLoad(): boolean {
  return getBoolean(PLAY_AUDIO_ON_LOAD_STORAGE_KEY, true);
}

export function setPlayAudioOnLoad(enabled: boolean) {
  setBoolean(PLAY_AUDIO_ON_LOAD_STORAGE_KEY, enabled);
}
