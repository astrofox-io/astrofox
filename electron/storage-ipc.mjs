import { get, getAll, remove, set } from './storage/kv.mjs';

/**
 * Key-value storage backed by the SQLite database in userData.
 * The renderer keeps a snapshot in preload and writes through here.
 *
 * @param {import('electron').IpcMain} ipcMain
 */
export function registerStorageIpc(ipcMain) {
  ipcMain.handle('storage:get-all', () => getAll());

  ipcMain.handle('storage:get', (_event, payload = {}) => get(payload.key));

  ipcMain.handle('storage:set', (_event, payload = {}) => {
    set(payload.key, payload.value);
    return { ok: true };
  });

  ipcMain.handle('storage:remove', (_event, payload = {}) => {
    remove(payload.key);
    return { ok: true };
  });
}
