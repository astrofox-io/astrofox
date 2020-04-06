import { ipcRenderer } from 'electron';
import EventEmitter from 'core/EventEmitter';
import { logger } from 'view/global';

export default class AppUpdater extends EventEmitter {
  constructor(options = {}) {
    super();

    this.checked = false;
    this.checking = false;
    this.downloading = false;
    this.downloadComplete = false;
    this.hasUpdate = false;
    this.installing = false;
    this.info = {};
    this.error = null;
    this.options = options;

    // New version available
    ipcRenderer.on('update-available', (event, info) => {
      this.checking = false;
      this.checked = true;
      this.hasUpdate = true;
      this.info = info;

      logger.timeEnd('check-for-updates', 'Update check complete', info);

      this.emit('status', 'update-available');

      // Automatically download update
      if (this.options.autoUpdate) {
        this.downloadUpdate();
      }
    });

    // Already at latest version
    ipcRenderer.on('update-not-available', (event, info) => {
      this.checking = false;
      this.checked = true;
      this.info = info;

      logger.timeEnd('check-for-updates', 'Update check complete', info);

      this.emit('status', 'update-not-available');
    });

    // Update downloaded successfully
    ipcRenderer.on('update-downloaded', (event, info) => {
      this.downloading = false;
      this.downloadComplete = true;
      this.info = info;

      logger.timeEnd('download-update', 'Download complete:', info);

      this.emit('status', 'update-downloaded');
    });

    // Update error
    ipcRenderer.on('update-error', (event, error) => {
      logger.error('Update error:', error);

      this.error = error;
    });
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
    }
  }

  quitAndInstall() {
    if (!this.installing) {
      this.installing = true;

      ipcRenderer.send('quit-and-install');
    }
  }
}
