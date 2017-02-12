import EventEmitter from './EventEmitter';
import Logger from './Logger';
import AppUpdater from './AppUpdater';

export const logger = new Logger('astrofox');
export const events = new EventEmitter();
export const appUpdater = new AppUpdater();

export function raiseError(msg, err) {
    if (err) {
        logger.error(msg + '\n', err);
    }

    events.emit('error', msg, err);
}