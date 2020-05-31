import EventEmitter from 'core/EventEmitter';
import { api, logger } from 'view/global';

export default class AppUpdater extends EventEmitter {
  constructor(properties = {}) {
    super();

    this.checked = false;
    this.checking = false;
    this.downloading = false;
    this.downloadComplete = false;
    this.hasUpdate = false;
    this.installing = false;
    this.info = {};
    this.error = null;
    this.properties = properties;

    // New version available
    api.on('update-available', info => {
      this.checking = false;
      this.checked = true;
      this.hasUpdate = true;
      this.info = info;

      logger.timeEnd('check-for-updates', 'Update check complete', info);

      this.emit('status', 'update-available');

      // Automatically download update
      if (this.properties.autoUpdate) {
        this.downloadUpdate();
      }
    });

    // Already at latest version
    api.on('update-not-available', info => {
      this.checking = false;
      this.checked = true;
      this.info = info;

      logger.timeEnd('check-for-updates', 'Update check complete', info);

      this.emit('status', 'update-not-available');
    });

    // Update downloaded successfully
    api.on('update-downloaded', info => {
      this.downloading = false;
      this.downloadComplete = true;
      this.info = info;

      logger.timeEnd('download-update', 'Download complete:', info);

      this.emit('status', 'update-downloaded');
    });

    // Update error
    api.on('update-error', error => {
      logger.error('Update error:', error);

      this.error = error;
    });
  }

  checkForUpdates() {
    if (!this.checking) {
      this.checking = true;
      this.error = null;

      logger.time('check-for-updates');

      api.send('check-for-updates');
    }
  }

  downloadUpdate() {
    if (!this.downloading) {
      this.downloading = true;

      logger.time('download-update');

      api.send('download-update');
    }
  }

  quitAndInstall() {
    if (!this.installing) {
      this.installing = true;

      api.send('quit-and-install');
    }
  }
}
