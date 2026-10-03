import { execFileSync, spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import electron from 'electron';
import { build } from 'esbuild';

// Bundles the actual components from a git revision and the working tree into
// one production-mode benchmark. Does not start or change the dev server.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => process.argv[process.argv.indexOf(name) + 1];
const baseline = process.argv.includes('--baseline')
  ? arg('--baseline')
  : '63971980224ed229e67f924c563fe08470f6a4d4';
const output = path.resolve(
  root,
  process.argv.includes('--output') ? arg('--output') : 'coverage/render-benchmark',
);
const scratch = await mkdtemp(path.join(os.tmpdir(), 'astrofox-render-benchmark-'));
await mkdir(output, { recursive: true });
const cache = new Map();
function baselineFile(name) {
  for (const candidate of [name, `${name}.ts`, `${name}.tsx`, `${name}.json`, `${name}/index.ts`]) {
    if (cache.has(candidate)) return candidate;
    try {
      const contents = execFileSync('git', ['show', `${baseline}:${candidate}`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      cache.set(candidate, contents);
      return candidate;
    } catch {
      /* Try the next module extension. */
    }
  }
  throw new Error(`Cannot resolve ${name} at ${baseline}`);
}
await build({
  entryPoints: [path.join(root, 'scripts/benchmarks/rendering.tsx')],
  outfile: path.join(scratch, 'bundle.js'),
  bundle: true,
  platform: 'browser',
  format: 'iife',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  tsconfig: path.join(root, 'tsconfig.json'),
  plugins: [
    {
      name: 'baseline',
      setup(builder) {
        builder.onResolve({ filter: /^baseline:/ }, args => ({
          path: baselineFile(`src/lib/core/render/layers/${args.path.slice(9)}.tsx`),
          namespace: 'baseline',
        }));
        builder.onResolve({ filter: /.*/, namespace: 'baseline' }, args => {
          if (args.path.startsWith('@/') || args.path.startsWith('.')) {
            const name = args.path.startsWith('@/')
              ? `src/${args.path.slice(2)}`
              : path.posix.normalize(path.posix.join(path.posix.dirname(args.importer), args.path));
            return { path: baselineFile(name), namespace: 'baseline' };
          }
          return builder.resolve(args.path, { resolveDir: root, kind: args.kind });
        });
        builder.onLoad({ filter: /.*/, namespace: 'baseline' }, args => ({
          contents: cache.get(args.path),
          loader: args.path.endsWith('.json') ? 'json' : args.path.endsWith('.tsx') ? 'tsx' : 'ts',
        }));
      },
    },
  ],
});
await writeFile(
  path.join(scratch, 'index.html'),
  '<!doctype html><html><body style="margin:0;background:black"><canvas id="stage"></canvas><script src="bundle.js"></script></body></html>',
);
const packageVersion = async name =>
  JSON.parse(await readFile(path.join(root, 'node_modules', name, 'package.json'), 'utf8')).version;
await writeFile(
  path.join(output, 'environment.json'),
  JSON.stringify(
    {
      baseline,
      node: process.version,
      os: `${os.platform()} ${os.release()} ${os.arch()}`,
      cpu: os.cpus()[0]?.model,
      dependencies: {
        three: await packageVersion('three'),
        fiber: await packageVersion('@react-three/fiber'),
        react: await packageVersion('react'),
        electron: await packageVersion('electron'),
      },
      date: new Date().toISOString(),
    },
    null,
    2,
  ),
);
const child = spawn(electron, [path.join(root, 'scripts/benchmarks/runner.cjs'), scratch, output], {
  cwd: root,
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
process.exitCode = await new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
