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

        autoUpdater.addListener('error', error => {
            log(error);
        });

        autoUpdater.addListener('checking-for-update', () => {
            log('checking-for-update');
        });

        autoUpdater.addListener('update-available', () => {
            log('update-available');
        });

        autoUpdater.addListener('update-not-available', () => {
            log('update-not-available');
        });

        autoUpdater.addListener('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
            log('update-downloaded');

            mainWindow.webContents.send('update-downloaded', {
                releaseNotes,
                releaseName,
                releaseDate,
                updateURL
            });
        });
    }

    checkForUpdates() {
        return autoUpdater.checkForUpdates()
            .then(result => {
                log(result);

                return result;
            });
    }

    quitAndInstall() {
        autoUpdater.quitAndInstall();
    }
}