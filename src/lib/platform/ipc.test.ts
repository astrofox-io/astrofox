import type { BrowserWindow, IpcMain } from 'electron';
import { describe, expect, it, vi } from 'vitest';
import { emit, handle, listen } from '../../../electron/ipc';
import { CHANNELS, isChannel } from './channels';

type Listener = (event: unknown, ...args: unknown[]) => unknown;

function fakeIpcMain() {
  const handlers = new Map<string, Listener>();
  const listeners = new Map<string, Set<Listener>>();

  const ipcMain = {
    handle: (name: string, handler: Listener) => {
      if (handlers.has(name))
        throw new Error(`Attempted to register a second handler for '${name}'`);
      handlers.set(name, handler);
    },
    removeHandler: (name: string) => handlers.delete(name),
    on: (name: string, listener: Listener) => {
      listeners.set(name, (listeners.get(name) ?? new Set()).add(listener));
    },
    removeListener: (name: string, listener: Listener) => listeners.get(name)?.delete(listener),
  };

  return {
    ipcMain: ipcMain as unknown as IpcMain,
    invoke: (name: string, event: unknown, payload?: unknown) => {
      const handler = handlers.get(name);
      if (!handler) throw new Error(`No handler registered for '${name}'`);
      return handler(event, payload);
    },
    send: (name: string, event: unknown, payload?: unknown) => {
      for (const listener of listeners.get(name) ?? []) listener(event, payload);
    },
    has: (name: string) => handlers.has(name),
  };
}

function fakeWindow() {
  const mainFrame = { name: 'main' };
  const sent: unknown[][] = [];
  const contents = {
    mainFrame,
    isDestroyed: () => false,
    send: (...args: unknown[]) => sent.push(args),
  };
  const window = {
    webContents: contents,
    isDestroyed: () => false,
  } as unknown as BrowserWindow;

  return {
    window,
    sent,
    fromApp: { sender: contents, senderFrame: mainFrame },
    fromSubframe: { sender: contents, senderFrame: { name: 'iframe' } },
    fromOtherWindow: { sender: { mainFrame }, senderFrame: mainFrame },
  };
}

describe('the channel table', () => {
  it('knows each channel by kind', () => {
    expect(isChannel('window:minimize', 'invoke')).toBe(true);
    expect(isChannel('window:minimize', 'event')).toBe(false);
    expect(isChannel('mcp:ready', 'send')).toBe(true);
    expect(isChannel('updater:status', 'event')).toBe(true);
    expect(isChannel('toString', 'invoke')).toBe(false);
    expect(isChannel(42, 'invoke')).toBe(false);
  });

  it('names every channel with a namespace', () => {
    for (const name of Object.keys(CHANNELS)) {
      expect(name).toMatch(/^[a-z]+[:-][a-z-]+$/);
    }
  });
});

describe('handle', () => {
  it('answers the app window and refuses anything else', async () => {
    const ipc = fakeIpcMain();
    const app = fakeWindow();
    const handler = vi.fn((_filePath: string) => {});

    handle(ipc.ipcMain, () => app.window, { 'desktop:show-item-in-folder': handler });

    ipc.invoke('desktop:show-item-in-folder', app.fromApp, '/a');
    await expect(async () =>
      ipc.invoke('desktop:show-item-in-folder', app.fromSubframe, '/b'),
    ).rejects.toThrow(/outside the app window/);
    await expect(async () =>
      ipc.invoke('desktop:show-item-in-folder', app.fromOtherWindow, '/c'),
    ).rejects.toThrow(/outside the app window/);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('/a');
  });

  it('refuses everything once the window is gone', async () => {
    const ipc = fakeIpcMain();
    const app = fakeWindow();

    handle(ipc.ipcMain, () => null, { 'window:get-state': () => ({}) as never });

    await expect(async () => ipc.invoke('window:get-state', app.fromApp)).rejects.toThrow();
  });

  it('refuses a name that is not in the table, before registering anything', () => {
    const ipc = fakeIpcMain();

    expect(() =>
      handle(ipc.ipcMain, () => null, {
        'window:close': () => {},
        'desktop:open-path': () => {},
      } as never),
    ).toThrow(/desktop:open-path/);
    expect(ipc.has('window:close')).toBe(false);
  });

  it('refuses a channel of another kind', () => {
    const ipc = fakeIpcMain();

    expect(() => handle(ipc.ipcMain, () => null, { 'mcp:ready': () => {} } as never)).toThrow(
      /Not a invoke channel/,
    );
  });

  it('removes its handlers again', () => {
    const ipc = fakeIpcMain();
    const remove = handle(ipc.ipcMain, () => null, { 'window:close': () => {} });

    remove();
    expect(ipc.has('window:close')).toBe(false);
  });
});

describe('listen', () => {
  it('drops messages from outside the app window', () => {
    const ipc = fakeIpcMain();
    const app = fakeWindow();
    const ready = vi.fn();

    const stop = listen(ipc.ipcMain, () => app.window, { 'mcp:ready': ready });

    ipc.send('mcp:ready', app.fromSubframe);
    expect(ready).not.toHaveBeenCalled();

    ipc.send('mcp:ready', app.fromApp);
    expect(ready).toHaveBeenCalledTimes(1);

    stop();
    ipc.send('mcp:ready', app.fromApp);
    expect(ready).toHaveBeenCalledTimes(1);
  });
});

describe('emit', () => {
  it('sends to an open window only', () => {
    const app = fakeWindow();

    emit(app.window, 'window-state-changed', { focused: true, maximized: false, minimized: false });
    emit(null, 'mcp:probe');

    expect(app.sent).toEqual([
      ['window-state-changed', { focused: true, maximized: false, minimized: false }],
    ]);
  });
});
