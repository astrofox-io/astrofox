'use strict';

const EventEmitter = require('./EventEmitter');
const Logger = require('./Logger');

const logger = new Logger();
const events = new EventEmitter();

function raiseError(msg, err) {
    if (err) {
        logger.error(msg + "\n", err);
    }

    events.emit('error', msg, err);
}

module.exports = {
    events,
    logger,
    raiseError
};