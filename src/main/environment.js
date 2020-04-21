import path from 'path';
import { app } from 'electron';
import os from 'os';

const version = app.getVersion();

export const APP_NAME = 'Astrofox';
export const APP_VERSION = version;
export const APP_PATH = app.getAppPath();
export const OS_PLATFORM = os.platform();
export const IS_WINDOWS = OS_PLATFORM === 'win32';
export const IS_MACOS = OS_PLATFORM === 'darwin';
export const USER_AGENT = `${APP_NAME}/${APP_VERSION}`;
export const USER_DATA_PATH = app.getPath('userData');
export const TEMP_PATH = path.join(app.getPath('temp'), APP_NAME);
export const FFMPEG_PATH = path.join(APP_PATH, '..', 'bin', IS_WINDOWS ? 'ffmpeg.exe' : 'ffmpeg');
export const APP_CONFIG_FILE = path.join(
  USER_DATA_PATH,
  process.env.NODE_ENV === 'production' ? 'app.config' : 'app-dev.config',
);
export const LICENSE_FILE = path.join(USER_DATA_PATH, 'license.dat');
export const ELECTRON_VERSION = process.versions.electron;
