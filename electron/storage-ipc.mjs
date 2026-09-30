import { handle } from './generated/ipc.mjs';
import { getAll, remove, set } from './storage/kv.mjs';

/**
 * Key-value storage backed by the SQLite database in userData.
 * The renderer keeps a snapshot in preload and writes through here.
 *
 * @param {import('electron').IpcMain} ipcMain
 * @param {() => import('electron').BrowserWindow | null} getMainWindow
 */
export function registerStorageIpc(ipcMain, getMainWindow) {
  handle(ipcMain, getMainWindow, {
    'storage:get-all': () => getAll(),
    'storage:set': (payload = {}) => {
      set(payload.key, payload.value);
      return { ok: true };
    },
    'storage:remove': (payload = {}) => {
      remove(payload.key);
      return { ok: true };
    },
  });
}
