import path from 'path';
import { app } from 'electron';
import os from 'os';

const version = app.getVersion();
const platform = os.platform();

export const APP_NAME = 'Astrofox';
export const APP_VERSION = version;
export const APP_PATH = app.getAppPath();
export const USER_AGENT = `${APP_NAME}/${APP_VERSION}`;
export const USER_DATA_PATH = app.getPath('userData');
export const TEMP_PATH = path.join(app.getPath('temp'), APP_NAME);
export const FFMPEG_PATH = path.join(
    APP_PATH,
    '..',
    'bin',
    platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
);
export const APP_CONFIG_FILE = path.join(
    USER_DATA_PATH,
    process.env.NODE_ENV === 'production' ? 'app.config' : 'app-dev.config',
);
export const LICENSE_FILE = path.join(USER_DATA_PATH, 'license.dat');
