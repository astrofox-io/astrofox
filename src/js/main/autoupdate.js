import { autoUpdater } from 'electron-updater';
import * as os from 'os';
import debug from 'debug';
import { mainWindow } from 'main/window';

const log = debug('autoupdate');

export default class AppUpdater {
    constructor() {
        const platform = os.platform();

        if (platform === 'linux') {
            return;
        }

        autoUpdater.autoDownload = false;

        autoUpdater.on('error', error => {
            log('update-error');

            this.sendMessage('update-error', error.stack || error.message);
        });

        autoUpdater.on('checking-for-update', () => {
            log('checking-for-update');
        });

        autoUpdater.on('update-available', () => {
            log('update-available');

            this.sendMessage('update-available');
        });

        autoUpdater.on('update-not-available', () => {
            log('update-not-available');

            this.sendMessage('update-not-available');
        });

        autoUpdater.on('update-downloaded', () => {
            log('update-downloaded');

            this.sendMessage('update-downloaded');
        });
    }

    checkForUpdates() {
        return autoUpdater.checkForUpdates();
    }

    quitAndInstall() {
        return autoUpdater.quitAndInstall();
    }

    downloadUpdate() {
        return autoUpdater.downloadUpdate();
    }

    sendMessage(channel, data) {
        mainWindow.webContents.send(channel, data);
    }
}