import EventEmitter from 'core/EventEmitter';
import Logger from 'core/Logger';

export const logger = new Logger('astrofox');
export const events = new EventEmitter();

export function raiseError(msg, err) {
    if (err) {
        logger.error(msg + '\n', err);
    }

    events.emit('error', msg, err);
}