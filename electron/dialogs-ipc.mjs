import { BrowserWindow, dialog } from 'electron';
import { handle } from './generated/ipc.mjs';

/**
 * @param {import('electron').IpcMain} ipcMain
 * @param {() => import('electron').BrowserWindow | null} getMainWindow
 */
export function registerDialogIpc(ipcMain, getMainWindow) {
  function resolveParent() {
    return BrowserWindow.getFocusedWindow() || getMainWindow() || undefined;
  }

  handle(ipcMain, getMainWindow, {
    'dialog:show-save': async (options = {}) => {
      const result = await dialog.showSaveDialog(resolveParent(), {
        title: options.title,
        defaultPath: options.defaultPath,
        filters: options.filters,
        properties: options.properties,
      });
      return {
        canceled: Boolean(result.canceled),
        filePath: result.filePath || '',
      };
    },
    'dialog:show-open': async (options = {}) => {
      const properties = ['openFile'];
      if (options.multiple) {
        properties.push('multiSelections');
      }
      const result = await dialog.showOpenDialog(resolveParent(), {
        title: options.title,
        defaultPath: options.defaultPath,
        filters: options.filters,
        properties,
      });
      return {
        canceled: Boolean(result.canceled),
        filePaths: result.filePaths || [],
      };
    },
  });
}
