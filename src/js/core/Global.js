import EventEmitter from './EventEmitter';
import Logger from './Logger';
import LicenseManager from './LicenseManager';

export const logger = new Logger('astrofox');
export const events = new EventEmitter();
export const license = new LicenseManager();

export function raiseError(msg, err) {
    if (err) {
        logger.error(msg + '\n', err);
    }

    events.emit('error', msg, err);
}