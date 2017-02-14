import { autoUpdater } from 'electron-updater';
import * as os from 'os';
import debug from 'debug';
import { mainWindow } from './window';

const log = debug('autoupdate');

export default class AppUpdater {
    constructor() {
        const platform = os.platform();

        if (platform === 'linux') {
            return;
        }

        autoUpdater.autoDownload = false;

        autoUpdater.addListener('error', error => {
            log('update-error');

            this.sendMessage('update-error', error.message);
        });

        autoUpdater.addListener('checking-for-update', () => {
            log('checking-for-update');
        });

        autoUpdater.addListener('update-available', () => {
            log('update-available');

            this.sendMessage('update-available');
        });

        autoUpdater.addListener('update-not-available', () => {
            log('update-not-available');

            this.sendMessage('update-not-available');
        });

        autoUpdater.addListener('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
            log('update-downloaded');

            this.sendMessage(
                'update-downloaded',
                {
                    releaseNotes,
                    releaseName,
                    releaseDate,
                    updateURL
                }
            );
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