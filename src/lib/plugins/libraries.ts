/**
 * Libraries the host can hand to worker-runtime plugins on request, so
 * plugins don't need to bundle their own copies. Files are copied into
 * public/plugin-libs by scripts/copy-plugin-libs.mjs and imported by the
 * sandbox worker via absolute URL (relative imports inside the library
 * resolve correctly that way, unlike blob: modules).
 */
export const PLUGIN_LIBRARY_PATHS: Record<string, string> = {
  three: '/plugin-libs/three/three.module.min.js',
};

// Sandbox worker script URLs. Served with a CSP (see
// electron/plugin-sandbox-policy.mjs) that blocks network access and remote
// code; the "-net" variant allows connections for plugins holding the
// "network" permission. Paths must match that policy file.
export const PLUGIN_SANDBOX_PATH = '/plugin-libs/sandbox.js';
export const PLUGIN_SANDBOX_NETWORK_PATH = '/plugin-libs/sandbox-net.js';

export const KNOWN_LIBRARIES = new Set(Object.keys(PLUGIN_LIBRARY_PATHS));

export interface PluginLibraryRef {
  name: string;
  url: string;
}

function hostBase(): string {
  return typeof location !== 'undefined' ? location.href : 'http://localhost/';
}

export function resolveSandboxWorkerUrl(permissions: string[]): string {
  const path = permissions.includes('network') ? PLUGIN_SANDBOX_NETWORK_PATH : PLUGIN_SANDBOX_PATH;
  return new URL(path, hostBase()).href;
}

export function resolvePluginLibraries(names: string[]): PluginLibraryRef[] {
  const base = hostBase();

  return names
    .filter(name => KNOWN_LIBRARIES.has(name))
    .map(name => ({ name, url: new URL(PLUGIN_LIBRARY_PATHS[name], base).href }));
}
