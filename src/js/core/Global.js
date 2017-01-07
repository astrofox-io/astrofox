'use strict';

const EventEmitter = require('./EventEmitter');
const Logger = require('./Logger');

module.exports = {
    events: new EventEmitter(),
    logger: new Logger()
};