import type { AutomationRequest, AutomationResponse } from '@/lib/automation/protocol';
import type {
  McpStatus,
  PlatformEnvironment,
  UpdaterResult,
  UpdaterStatus,
  WindowState,
} from './types';

/**
 * Every IPC channel between the Electron main process and the app window,
 * with its payload and result types. This table is the whole desktop
 * contract:
 *
 * - the main process registers handlers through `electron/ipc.ts`, which
 *   refuses a name that is not here and answers only the app window's main
 *   frame;
 * - the preload (`electron/preload.ts`) exposes exactly these channels;
 * - the desktop adapter (`./desktop.ts`) calls them, typed from here.
 *
 * Adding a capability is an entry here plus its handler in the main process.
 *
 * Kinds: `invoke` is a request from the window with a result, `send` is a
 * message from the window with no reply, `event` is pushed by the main
 * process to the window.
 */

type Channel<Kind extends string, Payload, Result> = {
  kind: Kind;
  /** Type-only markers; never set. */
  payload?: Payload;
  result?: Result;
};

function invoke<Payload = never, Result = void>() {
  return { kind: 'invoke' } as Channel<'invoke', Payload, Result>;
}

function send<Payload = never>() {
  return { kind: 'send' } as Channel<'send', Payload, void>;
}

function event<Payload = never>() {
  return { kind: 'event' } as Channel<'event', Payload, void>;
}

export type NativeDialogFilter = { name: string; extensions: string[] };
type Bytes = Uint8Array | ArrayBuffer;

export const CHANNELS = {
  // Environment and settings, read once by the preload.
  'desktop:get-environment': invoke<never, PlatformEnvironment>(),
  'storage:get-all': invoke<never, Record<string, string>>(),
  'storage:set': invoke<{ key: string; value: string }, { ok: boolean }>(),
  'storage:remove': invoke<{ key: string }, { ok: boolean }>(),

  // Window chrome.
  'window:minimize': invoke(),
  'window:maximize': invoke<never, WindowState>(),
  'window:close': invoke(),
  'window:get-state': invoke<never, WindowState>(),
  'window-state-changed': event<WindowState>(),

  // Native dialogs and files by absolute path.
  'dialog:show-save': invoke<
    { title?: string; defaultPath?: string; filters?: NativeDialogFilter[] },
    { canceled: boolean; filePath: string }
  >(),
  'dialog:show-open': invoke<
    { title?: string; defaultPath?: string; filters?: NativeDialogFilter[]; multiple?: boolean },
    { canceled: boolean; filePaths: string[] }
  >(),
  'desktop:read-file': invoke<{ filePath: string }, { name: string; data: Bytes }>(),
  'desktop:write-file': invoke<
    { filePath: string; data: Bytes | string },
    { ok: boolean; filePath: string }
  >(),
  'desktop:write-temp-file': invoke<{ name: string; data: Bytes }, { filePath: string }>(),
  'desktop:remove-path': invoke<{ filePath: string }, { ok: boolean }>(),
  'desktop:show-item-in-folder': invoke<string>(),

  // ffmpeg, by export job (electron/ffmpeg.ts).
  'ffmpeg:run': invoke<{ job: string; args: string[] }>(),
  'ffmpeg:start-pipe': invoke<{ job: string; args: string[] }>(),
  'ffmpeg:write': invoke<{ job: string; data: Bytes }>(),
  'ffmpeg:end-pipe': invoke<{ job: string }>(),
  'ffmpeg:cancel': invoke<{ job: string }>(),

  // Auto-update.
  'updater:get-status': invoke<never, UpdaterStatus | null>(),
  'updater:check': invoke<never, UpdaterResult>(),
  'updater:download': invoke<never, UpdaterResult>(),
  'updater:install': invoke<never, UpdaterResult>(),
  'updater:status': event<UpdaterStatus>(),

  // MCP settings (electron/mcp-controller.mjs).
  'mcp:get-status': invoke<never, McpStatus>(),
  'mcp:set-enabled': invoke<boolean, McpStatus>(),
  'mcp:reset-token': invoke<never, McpStatus>(),

  // MCP command channel and file access (electron/mcp/server.ts, while it runs).
  'mcp:command': event<AutomationRequest>(),
  'mcp:probe': event(),
  'mcp:ready': send(),
  'mcp:not-ready': send(),
  'mcp:response': send<AutomationResponse>(),
  'mcp:read-file': invoke<string, { name: string; data: Bytes }>(),
  'mcp:write-project': invoke<
    { path: string; text: string; overwrite: boolean },
    { path: string }
  >(),
  'mcp:check-output': invoke<{ path: string; overwrite: boolean }, { path: string }>(),
};

type Channels = typeof CHANNELS;
export type ChannelName = keyof Channels;

type NamesOf<Kind extends string> = {
  [K in ChannelName]: Channels[K]['kind'] extends Kind ? K : never;
}[ChannelName];

export type InvokeChannel = NamesOf<'invoke'>;
export type SendChannel = NamesOf<'send'>;
export type EventChannel = NamesOf<'event'>;

export type PayloadOf<K extends ChannelName> = Exclude<Channels[K]['payload'], undefined>;
export type ResultOf<K extends ChannelName> = Exclude<Channels[K]['result'], undefined>;

/** The arguments after the channel name: none when the channel takes no payload. */
export type PayloadArgs<K extends ChannelName> = [PayloadOf<K>] extends [never]
  ? []
  : [payload: PayloadOf<K>];

export function isChannel(name: unknown, kind: 'invoke' | 'send' | 'event'): boolean {
  return (
    typeof name === 'string' &&
    Object.hasOwn(CHANNELS, name) &&
    CHANNELS[name as ChannelName].kind === kind
  );
}

/**
 * What the preload exposes to the app window as `window.__ASTROFOX__`. Typed
 * from the table, so the two sides cannot drift.
 */
export interface DesktopBridge {
  isDesktop: true;
  environment: PlatformEnvironment;
  /**
   * Synchronous key-value storage backed by SQLite in the main process (the
   * desktop backend of `lib/storage`). Reads come from a snapshot cached in the
   * preload; writes apply to the cache immediately and persist in order.
   */
  storage: {
    get(key: string): string | null;
    keys(): string[];
    set(key: string, value: string): void;
    remove(key: string): void;
    flush(): Promise<void>;
  };
  invoke<K extends InvokeChannel>(channel: K, ...payload: PayloadArgs<K>): Promise<ResultOf<K>>;
  send<K extends SendChannel>(channel: K, ...payload: PayloadArgs<K>): void;
  on<K extends EventChannel>(
    channel: K,
    listener: (...payload: PayloadArgs<K>) => void,
  ): () => void;
}
