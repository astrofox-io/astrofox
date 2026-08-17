/**
 * Copies the plugin sandbox worker and the host-provided plugin libraries
 * (currently three.js) into public/plugin-libs. Worker plugins import the
 * libraries by URL instead of bundling their own copy, and the sandbox worker
 * is served by URL (not blob:) so it can carry a CSP header. Runs on install
 * and before builds.
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const threeDir = resolve(root, 'node_modules/three');
const libsDir = resolve(root, 'public/plugin-libs');
const outDir = resolve(libsDir, 'three');
const sandboxSource = resolve(root, 'src/lib/plugins/sandboxWorker.js');

const threePkg = JSON.parse(await readFile(resolve(threeDir, 'package.json'), 'utf8'));

// three.module.min.js imports ./three.core.min.js, so both are needed.
const files = ['three.module.min.js', 'three.core.min.js'];

await mkdir(outDir, { recursive: true });

// Two copies of the same worker: each path gets its own CSP header (see
// electron/plugin-sandbox-policy.mjs), selected by the "network" permission.
await copyFile(sandboxSource, resolve(libsDir, 'sandbox.js'));
await copyFile(sandboxSource, resolve(libsDir, 'sandbox-net.js'));

for (const file of files) {
  await copyFile(resolve(threeDir, 'build', file), resolve(outDir, file));
}

await writeFile(
  resolve(outDir, 'version.json'),
  `${JSON.stringify({ name: 'three', version: threePkg.version }, null, 2)}\n`,
);

console.log(`Copied plugin sandbox worker and three@${threePkg.version} to public/plugin-libs`);
