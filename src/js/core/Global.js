'use strict';

const remote = window.require('electron').remote;
const path = window.require('path');

const EventEmitter = require('./EventEmitter');
const Logger = require('./Logger');

const APP_NAME = 'Astrofox';
const APP_VERSION = '1.0.0';
const USER_DATA_PATH = remote.app.getPath('userData');
const TEMP_PATH = path.join(remote.app.getPath('temp'), APP_NAME);
const FFMPEG_PATH = path.join(remote.app.getAppPath(), '..', 'bin', (process.platform === 'win32') ? 'ffmpeg.exe' : 'ffmpeg');

module.exports = {
    APP_NAME,
    APP_VERSION,
    USER_DATA_PATH,
    TEMP_PATH,
    FFMPEG_PATH,
    Events: new EventEmitter(),
    Logger: new Logger()
};