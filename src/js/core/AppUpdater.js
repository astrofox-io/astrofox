'use strict';

const { app, autoUpdater } = window.require('electron').remote;
const os = window.require('os');
const EventEmitter = require('./EventEmitter');
const { Logger } = require('./Global');

class AppUpdater extends EventEmitter {
    constructor(url) {
        super();

        autoUpdater.removeAllListeners();

        let platform = os.platform(),
            arch = os.arch(),
            version = app.getVersion(),
            feedUrl = `https://${url}/update/${platform}_${arch}/${version}`;
        
        autoUpdater.addListener('update-available', () => {
            Logger.log('A new update is available');
        });

        autoUpdater.addListener('update-downloaded', (e, releaseNotes, releaseName, releaseDate, updateURL) => {
            Logger.log('Update downloaded', releaseNotes, releaseName, releaseDate, updateURL);

            this.emit('update-downloaded', {
                releaseNotes, releaseName, releaseDate, updateURL
            });
        });

        autoUpdater.addListener('error', (error) => {
            Logger.error(error);
        });

        autoUpdater.addListener('checking-for-update', () => {
            Logger.log('checking-for-update');
        });

        autoUpdater.addListener('update-not-available', () => {
            Logger.log('update-not-available');
        });

        Logger.log('URL:', feedUrl);

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