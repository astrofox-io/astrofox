const AUTO_UPDATE_CHECK_STORAGE_KEY = 'astrofox.auto-update-check';

/** Whether the app should automatically check for updates on startup. Defaults to true. */
export function getAutoUpdateCheck(): boolean {
  try {
    return window.localStorage?.getItem(AUTO_UPDATE_CHECK_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setAutoUpdateCheck(enabled: boolean) {
  try {
    window.localStorage?.setItem(AUTO_UPDATE_CHECK_STORAGE_KEY, String(enabled));
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}
