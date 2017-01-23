import path from 'path';
import electron from 'electron';

const { app } = electron;

export const APP_NAME = 'Astrofox';
export const APP_VERSION = '1.0.0';
export const APP_PATH = app.getAppPath();
export const USER_DATA_PATH = app.getPath('userData');
export const TEMP_PATH = path.join(app.getPath('temp'), APP_NAME);
export const FFMPEG_PATH = path.join(APP_PATH, '..', 'bin', (process.platform === 'win32') ? 'ffmpeg.exe' : 'ffmpeg');
export const APP_CONFIG_FILE = path.join(USER_DATA_PATH, 'app.config');
export const DEFAULT_PROJECT = path.join(APP_PATH, 'projects', 'default.afx');
export const UPDATE_SERVER_URL = 'localhost:3333';