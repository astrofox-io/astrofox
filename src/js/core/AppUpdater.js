'use strict';

const { app, autoUpdater } = window.require('electron').remote;
const os = window.require('os');
const EventEmitter = require('./EventEmitter');
const { logger } = require('./Global');

class AppUpdater extends EventEmitter {
    constructor(url) {
        super();

        autoUpdater.removeAllListeners();

        let platform = os.platform(),
            arch = os.arch(),
            version = app.getVersion(),
            feedUrl = `https://${url}/update/${platform}_${arch}/${version}`;
        
        autoUpdater.addListener('update-available', () => {
            logger.log('A new update is available');
        });

        autoUpdater.addListener('update-downloaded', (e, releaseNotes, releaseName, releaseDate, updateURL) => {
            logger.log('Update downloaded', releaseNotes, releaseName, releaseDate, updateURL);

            this.emit('update-downloaded', {
                releaseNotes, releaseName, releaseDate, updateURL
            });
        });

        autoUpdater.addListener('error', (error) => {
            logger.error(error);
        });

        autoUpdater.addListener('checking-for-update', () => {
            logger.log('checking-for-update');
        });

        autoUpdater.addListener('update-not-available', () => {
            logger.log('update-not-available');
        });

        logger.log('URL:', feedUrl);

        this.feedUrl = feedUrl;
        this.initialized = false;
    }

    quitAndInstall() {
        autoUpdater.quitAndInstall();
    }

    checkForUpdates() {
        if (!this.initialized) {
            autoUpdater.setFeedURL(this.feedUrl);
            this.initialized = true;
        }
        autoUpdater.checkForUpdates();
    }
}

module.exports = AppUpdater;