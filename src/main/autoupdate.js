import { ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import debug from 'debug';
import { sendMessage } from './window';
import { USER_AGENT } from './environment';

const log = debug('autoupdate');

export default function init() {
  autoUpdater.autoDownload = false;
  autoUpdater.requestHeaders = { 'User-Agent': USER_AGENT };

  autoUpdater.on('error', error => {
    log('update-error');

    sendMessage('update-error', error.stack || error.message || error);
  });

  autoUpdater.on('checking-for-update', () => {
    log('checking-for-update');
  });

  autoUpdater.on('update-available', info => {
    log('update-available');

    sendMessage('update-available', info);
  });

  autoUpdater.on('update-not-available', info => {
    log('update-not-available');

    sendMessage('update-not-available', info);
  });

  autoUpdater.on('download-progress', progress => {
    log('download-progress', progress);

    sendMessage('download-progress', progress);
  });

  autoUpdater.on('update-downloaded', info => {
    log('update-downloaded');

    sendMessage('update-downloaded', info);
  });

  ipcMain.handle('check-for-updates', () => {
    return autoUpdater.checkForUpdates();
  });

  ipcMain.handle('download-update', () => {
    return autoUpdater.downloadUpdate();
  });

  ipcMain.handle('quit-and-install', () => {
    return autoUpdater.quitAndInstall();
  });
}
