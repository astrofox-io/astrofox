import { contextBridge, ipcRenderer } from 'electron';
import {
  type DesktopBridge,
  type EventChannel,
  type InvokeChannel,
  isChannel,
  type SendChannel,
} from '../src/lib/platform/channels';

// Built to electron/generated/preload.mjs by scripts/build-electron.mjs.
//
// Exposes exactly the channels in src/lib/platform/channels.ts. The desktop
// adapter (src/lib/platform/desktop.ts) turns them into the Platform
// interface the app uses.

function assertChannel(name: unknown, kind: 'invoke' | 'send' | 'event') {
  if (!isChannel(name, kind)) {
    throw new Error(`Unknown ${kind} channel: ${String(name)}`);
  }
}

// Resolve the environment and the storage snapshot before exposing the bridge
// so `environment` and storage.get() stay synchronous.
const [environment, storageSnapshot] = await Promise.all([
  ipcRenderer.invoke('desktop:get-environment'),
  ipcRenderer.invoke('storage:get-all').catch(error => {
    console.error('storage:get-all failed:', error);
    return {};
  }),
]);

// This window is the only writer, so the in-memory cache is the source of
// truth for reads. Writes are applied here synchronously and then serialized
// to the main process in order.
const storageCache = new Map<string, string>(Object.entries(storageSnapshot ?? {}));
let storagePending: Promise<void> = Promise.resolve();

function queueStorageWrite(channel: 'storage:set' | 'storage:remove', payload: unknown) {
  storagePending = storagePending
    .then(() => ipcRenderer.invoke(channel, payload))
    .then(() => undefined)
    .catch(error => {
      console.error(`${channel} failed:`, error);
    });
}

function assertString(name: string, value: unknown) {
  if (typeof value !== 'string') {
    throw new TypeError(`storage ${name} must be a string`);
  }
}

const bridge: DesktopBridge = {
  isDesktop: true,

  environment,

  storage: {
    get: key => storageCache.get(key) ?? null,
    keys: () => Array.from(storageCache.keys()),
    set: (key, value) => {
      assertString('key', key);
      assertString('value', value);
      storageCache.set(key, value);
      queueStorageWrite('storage:set', { key, value });
    },
    remove: key => {
      assertString('key', key);
      storageCache.delete(key);
      queueStorageWrite('storage:remove', { key });
    },
    flush: () => storagePending,
  },

  invoke: (channel: InvokeChannel, ...payload: unknown[]) => {
    assertChannel(channel, 'invoke');
    return ipcRenderer.invoke(channel, ...payload);
  },

  send: (channel: SendChannel, ...payload: unknown[]) => {
    assertChannel(channel, 'send');
    ipcRenderer.send(channel, ...payload);
  },

  on: (channel: EventChannel, listener: (...payload: never[]) => void) => {
    assertChannel(channel, 'event');

    if (typeof listener !== 'function') {
      return () => {};
    }

    const wrapped = (_event: unknown, ...payload: unknown[]) =>
      (listener as (...args: unknown[]) => void)(...payload);

    ipcRenderer.on(channel, wrapped);

    return () => {
      ipcRenderer.removeListener(channel, wrapped);
    };
  },
} as DesktopBridge;

contextBridge.exposeInMainWorld('__ASTROFOX__', bridge);
