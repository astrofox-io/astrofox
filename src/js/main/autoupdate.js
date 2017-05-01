import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import path from 'path';
import * as os from 'os';
import debug from 'debug';
import { mainWindow } from './window';
import { APP_PATH } from './environment';

const log = debug('autoupdate');

export default class AppUpdater {
    constructor() {
        const platform = os.platform();

        if (platform === 'linux') {
            return;
        }

        autoUpdater.autoDownload = false;

        if (process.env.NODE_ENV !== 'production') {
            let file = path.join(APP_PATH, `app-update-${platform}.yml`);
            if (fs.existsSync(file)) {
                autoUpdater.updateConfigPath = file;
            }
        }

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