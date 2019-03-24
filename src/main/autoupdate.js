import { autoUpdater } from 'electron-updater';
import * as os from 'os';
import debug from 'debug';
import { getWindow } from './window';
import { USER_AGENT } from './environment';

const log = debug('autoupdate');

export default class AppUpdater {
  constructor() {
    const platform = os.platform();

    if (platform === 'linux') {
      return;
    }

    autoUpdater.autoDownload = false;
    autoUpdater.requestHeaders = { 'User-Agent': USER_AGENT };

    autoUpdater.on('error', error => {
      log('update-error');

      this.sendMessage('update-error', error.stack || error.message || error);
    });

    autoUpdater.on('checking-for-update', () => {
      log('checking-for-update');
    });

    autoUpdater.on('update-available', info => {
      log('update-available');

      this.sendMessage('update-available', info);
    });

    autoUpdater.on('update-not-available', info => {
      log('update-not-available');

      this.sendMessage('update-not-available', info);
    });

    autoUpdater.on('download-progress', progress => {
      log('download-progress', progress);

      this.sendMessage('download-progress', progress);
    });

    autoUpdater.on('update-downloaded', info => {
      log('update-downloaded');

      this.sendMessage('update-downloaded', info);
    });
  }

  checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall();
  }

  downloadUpdate() {
    autoUpdater.downloadUpdate();
  }

  sendMessage(channel, data) {
    getWindow().webContents.send(channel, data);
  }
}
