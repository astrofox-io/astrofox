const APP_NAME = "Astrofox";
const APP_VERSION =
	typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";
const RENDER_BACKEND =
	typeof import.meta !== "undefined" &&
	import.meta.env &&
	import.meta.env.VITE_RENDER_BACKEND
		? import.meta.env.VITE_RENDER_BACKEND
		: "legacy";
const USER_AGENT =
	typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
const PLATFORM =
	typeof navigator !== "undefined" ? navigator.platform || "" : "";
const IS_WINDOWS = /Win/.test(PLATFORM);
const IS_MACOS = /Mac/.test(PLATFORM);
const IS_LINUX = !IS_WINDOWS && !IS_MACOS;

export const env = {
	APP_NAME,
	APP_VERSION,
	OS_PLATFORM: PLATFORM,
	IS_WINDOWS,
	IS_MACOS,
	IS_LINUX,
	IS_WEB: true,
	RENDER_BACKEND,
	USER_AGENT,
	USER_DATA_PATH: null,
	APP_CONFIG_FILE: null,
};

export default env;
