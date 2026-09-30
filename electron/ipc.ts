import type { BrowserWindow, IpcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import {
  type ChannelName,
  type EventChannel,
  type InvokeChannel,
  isChannel,
  type PayloadArgs,
  type PayloadOf,
  type ResultOf,
  type SendChannel,
} from '../src/lib/platform/channels';

/**
 * The main-process side of the channel table (src/lib/platform/channels.ts).
 * Every handler goes through here, so every channel gets the same sender
 * check: only the app window's main frame is answered. A name that is not in
 * the table is refused when it is registered.
 */

type GetWindow = () => BrowserWindow | null;

export type InvokeHandlers = {
  [K in InvokeChannel]?: (payload: PayloadOf<K>) => ResultOf<K> | Promise<ResultOf<K>>;
};

export type SendListeners = {
  [K in SendChannel]?: (payload: PayloadOf<K>) => void;
};

/** True when the message came from the app window's top frame (not a subframe or another window). */
export function isTrustedSender(event: IpcMainEvent | IpcMainInvokeEvent, getWindow: GetWindow) {
  const contents = getWindow()?.webContents;
  return Boolean(
    contents &&
      !contents.isDestroyed() &&
      event.sender === contents &&
      event.senderFrame === contents.mainFrame,
  );
}

function assertChannel(name: string, kind: 'invoke' | 'send') {
  if (!isChannel(name, kind)) {
    throw new Error(`Not a ${kind} channel in src/lib/platform/channels.ts: ${name}`);
  }
}

/** Register request handlers. Returns a function that removes them again. */
export function handle(ipcMain: IpcMain, getWindow: GetWindow, handlers: InvokeHandlers) {
  const names = Object.keys(handlers) as InvokeChannel[];

  for (const name of names) {
    assertChannel(name, 'invoke');
  }

  for (const name of names) {
    const handler = handlers[name] as (payload: unknown) => unknown;

    ipcMain.handle(name, (event, payload) => {
      if (!isTrustedSender(event, getWindow)) {
        throw new Error(`Refused ${name} from outside the app window.`);
      }

      return handler(payload);
    });
  }

  return () => {
    for (const name of names) {
      ipcMain.removeHandler(name);
    }
  };
}

/** Register listeners for messages without a reply. Untrusted messages are dropped. */
export function listen(ipcMain: IpcMain, getWindow: GetWindow, listeners: SendListeners) {
  const entries = Object.entries(listeners) as [SendChannel, (payload: unknown) => void][];

  for (const [name] of entries) {
    assertChannel(name, 'send');
  }

  const bound = entries.map(([name, listener]) => {
    const wrapped = (event: IpcMainEvent, payload: unknown) => {
      if (isTrustedSender(event, getWindow)) {
        listener(payload);
      }
    };

    ipcMain.on(name, wrapped);
    return [name, wrapped] as const;
  });

  return () => {
    for (const [name, wrapped] of bound) {
      ipcMain.removeListener(name, wrapped);
    }
  };
}

/** Push an event to the app window, if it is still open. */
export function emit<K extends EventChannel>(
  window: BrowserWindow | null | undefined,
  channel: K,
  ...payload: PayloadArgs<K>
) {
  if (!window || window.isDestroyed()) {
    return;
  }

  window.webContents.send(channel, ...payload);
}

export type { ChannelName };
