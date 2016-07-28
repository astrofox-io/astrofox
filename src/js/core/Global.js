'use strict';

const EventEmitter = require('./EventEmitter.js');
const Logger = require('./Logger.js');

module.exports = {
    Events: new EventEmitter(),
    Logger: new Logger()
};