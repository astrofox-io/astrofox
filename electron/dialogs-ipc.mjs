import { BrowserWindow, dialog } from 'electron';

/**
 * @param {import('electron').IpcMain} ipcMain
 * @param {() => import('electron').BrowserWindow | null} getMainWindow
 */
export function registerDialogIpc(ipcMain, getMainWindow) {
  function resolveParent() {
    return BrowserWindow.getFocusedWindow() || getMainWindow() || undefined;
  }

  ipcMain.handle('dialog:show-save', async (_event, options = {}) => {
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
  });

  ipcMain.handle('dialog:show-open', async (_event, options = {}) => {
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
  });
}
