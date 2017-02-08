import path from 'path';
import { app } from 'electron';
import os from 'os';

const version = app.getVersion(),
    platform = os.platform();

export const APP_NAME = 'Astrofox';
export const APP_VERSION = version;
export const APP_PATH = app.getAppPath();
export const USER_DATA_PATH = app.getPath('userData');
export const TEMP_PATH = path.join(app.getPath('temp'), APP_NAME);
export const FFMPEG_PATH = path.join(APP_PATH, '..', 'bin', platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
export const APP_CONFIG_FILE = path.join(USER_DATA_PATH, 'app.config');
export const DEFAULT_PROJECT = path.join(APP_PATH, 'projects', 'default.afx');