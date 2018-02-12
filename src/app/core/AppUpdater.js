import { ipcRenderer } from 'electron';

import EventEmitter from 'core/EventEmitter';
import { logger } from 'core/Global';

export default class AppUpdater extends EventEmitter {
    constructor(app) {
        super();

        this.checking = false;
        this.downloading = false;
        this.downloadComplete = false;
        this.hasUpdate = false;
        this.installing = false;
        this.versionInfo = null;
        this.error = null;

        // New version available
        ipcRenderer.on('update-available', () => {
            this.hasUpdate = true;

            // Automatically download update
            if (app.config.autoUpdate) {
                this.downloadUpdate();
            }

            this.emit('update', 'update-available');
        });

        // Already at latest version
        ipcRenderer.on('update-not-available', () => {
            this.checking = false;

            this.emit('update', 'update-not-available');
        });

        // Update downloaded successfully
        ipcRenderer.on('update-downloaded', () => {
            this.downloading = false;
            this.downloadComplete = true;

            this.emit('update', 'update-downloaded');
        });

        // Update error
        ipcRenderer.on('update-error', (event, error) => {
            this.checkComplete(error);
        });

        // Check for updates response
        ipcRenderer.on('check-for-updates-complete', (event, data) => {
            this.checkComplete(null, data);
        });

        // Download update response
        ipcRenderer.on('download-update-complete', (event, data) => {
            logger.timeEnd('download-update', 'Download complete:', data);
        });
    }

    checkComplete(error, data) {
        this.checking = false;

        if (error) {
            logger.error(error);
            this.error = error;
        }

        if (data && data.versionInfo) {
            this.versionInfo = data.versionInfo;
        }

        logger.timeEnd('check-for-updates', 'Update check complete', data);

        this.emit('update', 'check-for-updates-complete');
    }

    checkForUpdates() {
        if (!this.checking) {
            this.checking = true;
            this.error = null;

            logger.time('check-for-updates');

            ipcRenderer.send('check-for-updates');
        }
    }

    downloadUpdate() {
        if (!this.downloading) {
            this.downloading = true;

            logger.time('download-update');

            ipcRenderer.send('download-update');

            this.emit('update', 'download-update');
        }
    }

    quitAndInstall() {
        if (!this.installing) {
            this.installing = true;

            ipcRenderer.send('quit-and-install');

            this.emit('update', 'quit-and-install');
        }
    }
}
