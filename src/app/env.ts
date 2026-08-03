// @ts-nocheck
const APP_NAME = 'Astrofox';
const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ||
  (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0');
const BUILD_TARGET = process.env.NEXT_PUBLIC_BUILD_TARGET || 'web';
const USER_AGENT = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

export const env = {
  APP_NAME,
  APP_VERSION,
  BUILD_TARGET,
  /** Build-time hint; runtime desktop is detected via `isDesktopApp()`. */
  IS_DESKTOP_BUILD: BUILD_TARGET === 'desktop',
  USER_AGENT,
  IS_DESKTOP: false,
  FFMPEG_PATH: null,
  FFMPEG_AVAILABLE: false,
  TEMP_PATH: null,
};

export default env;
