import { createRequire } from 'node:module';
import path from 'node:path';
import { PLUGIN_SANDBOX_HEADERS } from './electron/plugin-sandbox-policy.mjs';

const require = createRequire(import.meta.url);
const { version: appVersion } = require('./package.json');

/** @type {import("next").NextConfig} */
const resolveFromRoot = target => path.resolve(process.cwd(), target);
const shaderLoader = resolveFromRoot('loaders/glsl-loader.ts');

// Desktop offline package uses static export. Web/Vercel keeps the default Next build.
const isDesktopBuild = process.env.BUILD_TARGET === 'desktop';
const devDistDir = process.env.NEXT_DEV_DIST_DIR;

const nextConfig = {
  ...(devDistDir ? { distDir: devDistDir } : {}),
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_BUILD_TARGET: isDesktopBuild ? 'desktop' : 'web',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  ...(isDesktopBuild
    ? {
        output: 'export',
        images: { unoptimized: true },
        // Relative asset URLs work with the custom app protocol in Electron.
        assetPrefix: '.',
        trailingSlash: true,
      }
    : {}),
  turbopack: {
    resolveAlias: {
      '@': resolveFromRoot('src'),
    },
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      '*.glsl': {
        loaders: [shaderLoader],
        as: '*.js',
      },
      '*.vs': {
        loaders: [shaderLoader],
        as: '*.js',
      },
      '*.fs': {
        loaders: [shaderLoader],
        as: '*.js',
      },
      '*.vert': {
        loaders: [shaderLoader],
        as: '*.js',
      },
      '*.frag': {
        loaders: [shaderLoader],
        as: '*.js',
      },
    },
  },
  // Headers/rewrites are unsupported with `output: 'export'` (desktop); the
  // Electron protocol handler applies the same sandbox CSP there.
  headers: isDesktopBuild
    ? undefined
    : async () =>
        PLUGIN_SANDBOX_HEADERS.map(({ path: source, csp }) => ({
          source,
          headers: [{ key: 'Content-Security-Policy', value: csp }],
        })),
  // Rewrites are unsupported with `output: 'export'` (desktop).
  rewrites: isDesktopBuild
    ? undefined
    : async () => [
        {
          source: '/u.js',
          destination: 'https://cloud.umami.is/script.js',
        },
      ],
};

export default nextConfig;
