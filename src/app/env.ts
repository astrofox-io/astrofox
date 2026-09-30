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
  /** Build-time hint; the runtime answer is `platform.isDesktop` (`@/lib/platform`). */
  IS_DESKTOP_BUILD: BUILD_TARGET === 'desktop',
  USER_AGENT,
};

export default env;
