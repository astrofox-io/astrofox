export function trimChars(str) {
	// eslint-disable-next-line no-control-regex
	return str.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
}
