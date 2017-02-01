import { ipcRenderer } from 'electron';

import EventEmitter from './EventEmitter';
import { logger } from './Global';

export default class AppUpdater extends EventEmitter {
    constructor() {
        super();

        this.response = null;

        // IPC events
        ipcRenderer.on('check-for-updates-response', (event, arg) => {
            logger.timeEnd('check-for-updates', arg);

            this.response = arg;

            this.emit('check-complete', this.response);
        });
    }

    checkForUpdates() {
        logger.time('check-for-updates');

        ipcRenderer.send('check-for-updates');
    }

    quitAndInstall() {
        ipcRenderer.send('quit-and-install');
    }
}