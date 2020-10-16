import { ipcMain, dialog } from 'electron';
import debug from 'debug';
import { getWindow, getWindowState } from './window';

const log = debug('preload');

export default function init() {
  ipcMain.handle('log', (event, data) => {
    log(data);
  });

  ipcMain.handle('get-global', (event, key) => {
    return global[key];
  });

  ipcMain.handle('maximize-window', () => {
    const win = getWindow();
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle('unmaximize-window', () => {
    getWindow().unmaximize();
  });

  ipcMain.handle('minimize-window', () => {
    getWindow().minimize();
  });

  ipcMain.handle('close-window', () => {
    getWindow().close();
  });

  ipcMain.handle('open-dev-tools', () => {
    getWindow().webContents.openDevTools();
  });

  ipcMain.handle('show-open-dialog', (event, props) => {
    return dialog.showOpenDialog(getWindow(), props);
  });

  ipcMain.handle('show-save-dialog', (event, props) => {
    return dialog.showSaveDialog(getWindow(), props);
  });

  ipcMain.handle('get-window-state', () => {
    return getWindowState();
  });
}
