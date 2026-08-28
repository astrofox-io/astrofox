export type DesktopWindowState = {
  focused: boolean;
  maximized: boolean;
  minimized: boolean;
};

export type DesktopEnvironment = {
  APP_NAME?: string;
  APP_VERSION?: string;
  IS_DESKTOP?: boolean;
  IS_PACKAGED?: boolean;
  UPDATER_ENABLED?: boolean;
  OS_PLATFORM?: string;
  USER_DATA_PATH?: string;
  /** False when the desktop database could not be opened and settings live in memory only. */
  STORAGE_PERSISTENT?: boolean;
  TEMP_PATH?: string;
  FFMPEG_PATH?: string;
  FFMPEG_AVAILABLE?: boolean;
  ELECTRON_VERSION?: string;
  CHROME_VERSION?: string;
  USER_AGENT?: string;
};

export type DesktopDialogFilter = {
  name: string;
  extensions: string[];
};

export type DesktopUpdaterStatus =
  | { state: 'checking' }
  | { state: 'available'; version?: string; releaseDate?: string }
  | { state: 'not-available'; version?: string }
  | {
      state: 'downloading';
      percent: number;
      transferred: number;
      total: number;
      bytesPerSecond: number;
    }
  | { state: 'downloaded'; version?: string }
  | { state: 'error'; message: string };

export type DesktopUpdaterResult = { ok: boolean; reason?: string; version?: string };

export type DesktopUpdaterBridge = {
  getStatus: () => Promise<DesktopUpdaterStatus | null>;
  check: () => Promise<DesktopUpdaterResult>;
  download: () => Promise<DesktopUpdaterResult>;
  install: () => Promise<DesktopUpdaterResult>;
  onStatus: (callback: (status: DesktopUpdaterStatus) => void) => () => void;
};

/**
 * Synchronous key-value storage backed by SQLite in the main process.
 * Reads come from a snapshot cached in preload; writes are applied to the
 * cache immediately and persisted asynchronously in order.
 */
export type DesktopStorageBridge = {
  get: (key: string) => string | null;
  keys: () => string[];
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  /** Resolves once all queued writes have reached the database. */
  flush: () => Promise<void>;
};

export type DesktopBridge = {
  isDesktop: true;
  getEnvironment: () => DesktopEnvironment;
  storage?: DesktopStorageBridge;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<DesktopWindowState | undefined>;
  closeWindow: () => Promise<void>;
  getWindowState: () => Promise<DesktopWindowState>;
  openPath?: (targetPath: string) => Promise<string>;
  showItemInFolder?: (targetPath: string) => Promise<void>;
  showSaveDialog?: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: DesktopDialogFilter[];
  }) => Promise<{ canceled: boolean; filePath: string }>;
  showOpenDialog?: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: DesktopDialogFilter[];
    multiple?: boolean;
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;
  writeTempFile?: (name: string, data: ArrayBuffer | Uint8Array) => Promise<{ filePath: string }>;
  removePath?: (filePath: string) => Promise<{ ok: boolean }>;
  readFile?: (filePath: string) => Promise<{ name: string; data: Uint8Array | ArrayBuffer }>;
  writeFile?: (
    filePath: string,
    data: Uint8Array | ArrayBuffer | string,
  ) => Promise<{ ok: boolean; filePath: string }>;
  ffmpegRun?: (args: string[], id?: string) => Promise<{ ok: boolean; id?: string }>;
  ffmpegStartPipe?: (args: string[], id?: string) => Promise<{ id: string }>;
  ffmpegWrite?: (
    id: string,
    data: ArrayBuffer | Uint8Array,
  ) => Promise<{ ok: boolean; bytes: number }>;
  ffmpegEndPipe?: (id: string) => Promise<{ ok: boolean }>;
  ffmpegKill?: (id: string) => Promise<{ ok: boolean }>;
  onWindowStateChanged?: (callback: (state: DesktopWindowState) => void) => () => void;
  updater?: DesktopUpdaterBridge;
};

export function getDesktopBridge(): DesktopBridge | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const bridge = window.__ASTROFOX__;
  if (bridge?.isDesktop) {
    return bridge as DesktopBridge;
  }
  return null;
}

export function isDesktopApp() {
  return getDesktopBridge() !== null;
}

export function getDesktopPlatform() {
  return getDesktopBridge()?.getEnvironment?.()?.OS_PLATFORM;
}

export function isMacDesktop() {
  return getDesktopPlatform() === 'darwin';
}

export function isFfmpegAvailable() {
  const env = getDesktopBridge()?.getEnvironment?.();
  return Boolean(env?.FFMPEG_AVAILABLE && env?.FFMPEG_PATH);
}

/**
 * Auto-update is wired up in packaged desktop builds, plus dev builds running
 * the simulated updater (ASTROFOX_FAKE_UPDATE).
 */
export function isDesktopUpdaterAvailable() {
  const bridge = getDesktopBridge();
  const env = bridge?.getEnvironment?.();
  return Boolean(bridge?.updater && (env?.UPDATER_ENABLED ?? env?.IS_PACKAGED));
}

export function checkForDesktopUpdates(): Promise<DesktopUpdaterResult> {
  const updater = getDesktopBridge()?.updater;
  if (!updater) {
    return Promise.resolve({ ok: false, reason: 'unavailable' });
  }
  return updater.check();
}

export function getDesktopUpdaterStatus(): Promise<DesktopUpdaterStatus | null> {
  const updater = getDesktopBridge()?.updater;
  if (!updater) {
    return Promise.resolve(null);
  }
  return updater.getStatus();
}

export function downloadDesktopUpdate(): Promise<DesktopUpdaterResult> {
  const updater = getDesktopBridge()?.updater;
  if (!updater) {
    return Promise.resolve({ ok: false, reason: 'unavailable' });
  }
  return updater.download();
}

export function installDesktopUpdate(): Promise<DesktopUpdaterResult> {
  const updater = getDesktopBridge()?.updater;
  if (!updater) {
    return Promise.resolve({ ok: false, reason: 'unavailable' });
  }
  return updater.install();
}

export function onDesktopUpdaterStatus(callback: (status: DesktopUpdaterStatus) => void) {
  const updater = getDesktopBridge()?.updater;
  if (!updater) {
    return () => {};
  }
  return updater.onStatus(callback);
}
