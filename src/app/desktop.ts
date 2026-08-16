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
  OS_PLATFORM?: string;
  USER_DATA_PATH?: string;
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

export type DesktopBridge = {
  isDesktop: true;
  getEnvironment: () => DesktopEnvironment;
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
  ffmpegRun?: (args: string[]) => Promise<{ ok: boolean }>;
  ffmpegStartPipe?: (args: string[], id?: string) => Promise<{ id: string }>;
  ffmpegWrite?: (
    id: string,
    data: ArrayBuffer | Uint8Array,
  ) => Promise<{ ok: boolean; bytes: number }>;
  ffmpegEndPipe?: (id: string) => Promise<{ ok: boolean }>;
  ffmpegKill?: (id: string) => Promise<{ ok: boolean }>;
  onWindowStateChanged?: (callback: (state: DesktopWindowState) => void) => () => void;
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

export function isFfmpegAvailable() {
  const env = getDesktopBridge()?.getEnvironment?.();
  return Boolean(env?.FFMPEG_AVAILABLE && env?.FFMPEG_PATH);
}
