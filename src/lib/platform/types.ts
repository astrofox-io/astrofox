import type { AutomationRequest, AutomationResponse } from '@/lib/automation/protocol';

/**
 * What the app can ask of the machine it runs on. There is one Platform per
 * session, chosen once in `./index.ts`: the desktop adapter (Electron IPC) or
 * the web adapter (browser APIs). Capabilities only the desktop has are null
 * on the web, so callers check for the capability rather than for "desktop".
 */
export interface Platform {
  /** Running in the Electron app. Prefer checking a capability over this. */
  readonly isDesktop: boolean;
  /** Build and machine facts (app version, OS, paths). */
  readonly environment: PlatformEnvironment;
  /** File pickers and saving what they return. Present on both. */
  readonly dialogs: Dialogs;
  /** Enumerate installed font families. Desktop only; never used on the web. */
  readonly fonts: { list(): Promise<string[]> } | null;
  /** The native window chrome. Desktop only. */
  readonly window: AppWindow | null;
  /** Files by absolute path. Desktop only. */
  readonly files: NativeFiles | null;
  /** ffmpeg, when it is installed. Desktop only. */
  readonly encoder: Encoder | null;
  /** Auto-update, in packaged builds (or the simulated updater). Desktop only. */
  readonly updater: Updater | null;
  /** The MCP server and its command channel. Desktop only. */
  readonly automation: Automation | null;
}

export type PlatformEnvironment = {
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
  [key: string]: unknown;
};

// ---- Dialogs -----------------------------------------------------------------

export interface FileFilter {
  name?: string;
  mimeType?: string;
  extensions?: string[];
}

/** A File System Access handle, where the browser supports them. */
export interface FileHandle {
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (blob: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
  name: string;
}

/**
 * Pickers default to the web File System Access APIs, on the desktop too.
 * Set `preferNativePath` only when a real OS path is required (ffmpeg input
 * or output); the web ignores it.
 */
export interface OpenDialogOptions {
  filters?: FileFilter[];
  multiple?: boolean;
  preferNativePath?: boolean;
}

export interface SaveDialogOptions {
  filters?: FileFilter[];
  defaultPath?: string;
  preferNativePath?: boolean;
}

export type OpenDialogResult = {
  canceled: boolean;
  files: File[];
  fileHandles?: FileHandle[];
  filePaths?: string[];
};

export type SaveDialogResult = {
  canceled: boolean;
  fileHandle?: FileHandle;
  filePath?: string;
};

/** Where a save dialog said to write: a handle, an absolute path, or a download name. */
export type SaveTarget = FileHandle | string | null;

export interface Dialogs {
  showOpen(options?: OpenDialogOptions): Promise<OpenDialogResult>;
  showSave(options?: SaveDialogOptions): Promise<SaveDialogResult>;
  /**
   * Whether showSave lets the user pick a destination up front. When false
   * (browsers without File System Access), the browser decides at download.
   */
  canPickSaveLocation(options?: Pick<SaveDialogOptions, 'preferNativePath'>): boolean;
  /** Write to what showSave returned, or download under `fallbackName`. */
  write(target: SaveTarget, blob: Blob, fallbackName: string): Promise<void>;
}

// ---- Desktop capabilities ----------------------------------------------------

export type WindowState = {
  focused: boolean;
  maximized: boolean;
  minimized: boolean;
};

export interface AppWindow {
  minimize(): Promise<void>;
  /** Maximize, or restore when already maximized. */
  toggleMaximize(): Promise<WindowState>;
  close(): Promise<void>;
  getState(): Promise<WindowState>;
  onStateChange(listener: (state: WindowState) => void): () => void;
}

export interface NativeFiles {
  /** The app's temp directory; `writeTemp` writes here and `removeTemp` only deletes from here. */
  readonly tempPath: string;
  read(filePath: string): Promise<{ name: string; data: Uint8Array }>;
  write(filePath: string, data: Uint8Array | string): Promise<void>;
  /** Write into the temp directory and return the absolute path. */
  writeTemp(name: string, data: ArrayBuffer | Uint8Array): Promise<string>;
  /** Delete a file inside the temp directory. */
  removeTemp(filePath: string): Promise<boolean>;
  /** Show the file in the system file manager. */
  reveal(filePath: string): Promise<void>;
}

/**
 * ffmpeg in the main process, by export job: the job's processes are killed
 * together when it is cancelled, or when the window reloads or the app quits.
 */
export interface Encoder {
  /** Run ffmpeg to completion. Rejects with the end of its output when it fails. */
  run(job: string, args: string[]): Promise<void>;
  /** Start the job's pipe: ffmpeg reading raw frames from stdin. */
  startPipe(job: string, args: string[]): Promise<void>;
  /** Write frame bytes to the job's pipe. */
  write(job: string, data: ArrayBuffer | Uint8Array): Promise<void>;
  /** Close the job's pipe and wait for ffmpeg to finish. */
  endPipe(job: string): Promise<void>;
  /** Kill every process of the job; anything it starts afterwards is refused. */
  cancel(job: string): Promise<void>;
}

export type UpdaterStatus =
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

export type UpdaterResult = { ok: boolean; reason?: string; version?: string };

export interface Updater {
  getStatus(): Promise<UpdaterStatus | null>;
  check(): Promise<UpdaterResult>;
  download(): Promise<UpdaterResult>;
  install(): Promise<UpdaterResult>;
  onStatus(listener: (status: UpdaterStatus) => void): () => void;
}

export type McpStatus = {
  enabled: boolean;
  running: boolean;
  url: string;
  token: string;
  error: string | null;
};

export interface Automation {
  getStatus(): Promise<McpStatus>;
  setEnabled(enabled: boolean): Promise<McpStatus>;
  resetToken(): Promise<McpStatus>;
  /** Receive commands from the MCP server; the returned function stops. */
  onCommand(listener: (request: AutomationRequest) => void): () => void;
  respond(response: AutomationResponse): void;
  readFile(path: string): Promise<{ name: string; data: Uint8Array }>;
  writeProject(input: {
    path: string;
    text: string;
    overwrite: boolean;
  }): Promise<{ path: string }>;
  checkOutput(input: { path: string; overwrite: boolean }): Promise<{ path: string }>;
}
