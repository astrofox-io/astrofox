import { build } from 'esbuild';

await build({
  entryPoints: ['electron/mcp/server.ts'],
  outfile: 'electron/generated/mcp-server.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: ['electron'],
  // Some SDK dependencies still use CommonJS built-ins.
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
});
