interface AstrofoxDesktopBridge {
  isDesktop: true;
  getEnvironment: () => Record<string, unknown>;
  storage?: {
    get: (key: string) => string | null;
    keys: () => string[];
    set: (key: string, value: string) => void;
    remove: (key: string) => void;
    flush: () => Promise<void>;
  };
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<
    | {
        focused: boolean;
        maximized: boolean;
        minimized: boolean;
      }
    | undefined
  >;
  closeWindow: () => Promise<void>;
  getWindowState: () => Promise<{
    focused: boolean;
    maximized: boolean;
    minimized: boolean;
  }>;
  openPath?: (targetPath: string) => Promise<string>;
  showItemInFolder?: (targetPath: string) => Promise<void>;
  showSaveDialog?: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => Promise<{ canceled: boolean; filePath: string }>;
  showOpenDialog?: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
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
  onWindowStateChanged?: (
    callback: (state: { focused: boolean; maximized: boolean; minimized: boolean }) => void,
  ) => () => void;
  updater?: {
    check: () => Promise<{ ok: boolean; reason?: string; version?: string }>;
    download: () => Promise<{ ok: boolean; reason?: string }>;
    install: () => Promise<{ ok: boolean; reason?: string }>;
    onStatus: (callback: (status: Record<string, unknown>) => void) => () => void;
  };
}

interface Window {
  _astrofox: unknown;
  __astrofox?: Record<string, unknown>;
  __ASTROFOX__?: AstrofoxDesktopBridge;
  showOpenFilePicker?: (options?: {
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
    multiple?: boolean;
  }) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle>;
}

interface Navigator {
  requestMIDIAccess?: () => Promise<MIDIAccess>;
}

declare module 'jsmediatags/dist/jsmediatags.min.js' {
  const jsmediatags: {
    read(
      file: File | Blob | string,
      callbacks: {
        onSuccess: (result: { tags: Record<string, unknown> | null }) => void;
        onError: (error: unknown) => void;
      },
    ): void;
  };
  export default jsmediatags;
}
