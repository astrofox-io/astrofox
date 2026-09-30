import { build } from 'esbuild';

// Bundles the TypeScript parts of the Electron app into electron/generated/.
// They share the channel table in src/lib/platform/channels.ts with the app.
const shared = {
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: ['electron'],
};

await Promise.all([
  build({
    ...shared,
    entryPoints: ['electron/mcp/server.ts'],
    outfile: 'electron/generated/mcp-server.mjs',
    // Some SDK dependencies still use CommonJS built-ins.
    banner: {
      js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
  }),
  build({
    ...shared,
    entryPoints: ['electron/ipc.ts'],
    outfile: 'electron/generated/ipc.mjs',
  }),
  build({
    ...shared,
    entryPoints: ['electron/preload.ts'],
    outfile: 'electron/generated/preload.mjs',
  }),
]);
