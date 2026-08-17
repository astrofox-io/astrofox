/**
 * Content-Security-Policy for the plugin sandbox worker. Shared by the Next
 * server (web + dev, via next.config.mjs headers) and the desktop app
 * protocol handler (electron/main.mjs) so both origins serve the worker
 * script with identical restrictions. Kept in electron/ because src/ is not
 * shipped in the packaged desktop app.
 *
 * Paths must match src/lib/plugins/libraries.ts.
 */

export const PLUGIN_SANDBOX_PATH = '/plugin-libs/sandbox.js';
export const PLUGIN_SANDBOX_NETWORK_PATH = '/plugin-libs/sandbox-net.js';

// Same-origin scripts (host libraries such as three.js) and blob: modules
// (the plugin's own code, posted by the host) only. Nothing else may load
// and no connections may be opened.
export const PLUGIN_SANDBOX_CSP = [
  "default-src 'none'",
  "script-src 'self' blob:",
  "connect-src 'none'",
  "worker-src 'none'",
  "base-uri 'none'",
].join('; ');

// Variant for plugins holding the "network" permission: connections are
// allowed, but executable code still has to come from the host or the plugin
// bundle itself.
export const PLUGIN_SANDBOX_NETWORK_CSP = [
  "default-src 'none'",
  "script-src 'self' blob:",
  'connect-src *',
  "worker-src 'none'",
  "base-uri 'none'",
].join('; ');

export const PLUGIN_SANDBOX_HEADERS = [
  { path: PLUGIN_SANDBOX_PATH, csp: PLUGIN_SANDBOX_CSP },
  { path: PLUGIN_SANDBOX_NETWORK_PATH, csp: PLUGIN_SANDBOX_NETWORK_CSP },
];
