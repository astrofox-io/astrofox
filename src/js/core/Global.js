'use strict';

const EventEmitter = require('./EventEmitter');
const Logger = require('./Logger');

module.exports = {
    Events: new EventEmitter(),
    Logger: new Logger()
};