import { remote } from 'electron';
import path from 'path';

export const APP_NAME = 'Astrofox';
export const APP_VERSION = '1.0.0';
export const APP_PATH = remote.app.getAppPath();
export const USER_DATA_PATH = remote.app.getPath('userData');
export const TEMP_PATH = path.join(remote.app.getPath('temp'), APP_NAME);
export const FFMPEG_PATH = path.join(APP_PATH, '..', 'bin', (process.platform === 'win32') ? 'ffmpeg.exe' : 'ffmpeg');
export const APP_CONFIG_FILE = path.join(USER_DATA_PATH, 'app.config');