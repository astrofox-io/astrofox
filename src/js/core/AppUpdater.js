import { ipcRenderer } from 'electron';

import EventEmitter from './EventEmitter';
import { logger } from './Global';

export default class AppUpdater extends EventEmitter {
    constructor() {
        super();

        this.checking = false;
        this.downloading = false;
        this.downloadComplete = false;
        this.hasUpdate = false;
        this.versionInfo = null;

        ipcRenderer.on('update-available', () => {
            this.checking = false;
            this.downloading = true;
            this.hasUpdate = true;

            this.emit('update-available');
        });

        ipcRenderer.on('update-not-available', () => {
            this.checking = false;

            this.emit('update-not-available');
        });

        ipcRenderer.on('update-downloaded', (event, data) => {
            this.downloading = false;
            this.downloadComplete = true;

            this.emit('update-downloaded', null, data);
        });

        ipcRenderer.on('update-error', (event, error) => {
            this.checkComplete(error);
        });

        ipcRenderer.on('check-for-updates-complete', (event, data) => {
            this.checkComplete(null, data);
        });
    }

    checkComplete(error, data) {
        this.checking = false;

        if (error) {
            logger.error(error);
        }

        if (data && data.versionInfo) {
            this.versionInfo = data.versionInfo;
        }

        logger.timeEnd('check-for-updates', 'Update check complete', data);

        this.emit('check-for-updates-complete', error, data);
    }

    checkForUpdates() {
        if (!this.checking) {
            this.checking = true;

            logger.time('check-for-updates');

            ipcRenderer.send('check-for-updates');
        }
    }

    quitAndInstall() {
        ipcRenderer.send('quit-and-install');
    }
}