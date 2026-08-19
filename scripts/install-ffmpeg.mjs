/**
 * Download a platform ffmpeg binary into ./bin for desktop packaging.
 * Source mirrors the historical Astrofox ffmpeg host.
 *
 * Usage: node scripts/install-ffmpeg.mjs [--force]
 *
 * Exits non-zero if the download fails or produces an empty file, so that
 * `dist:*` / `build:desktop` scripts fail instead of packaging without ffmpeg.
 */
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.resolve(__dirname, '../bin');
const force = process.argv.includes('--force');

const platform = os.platform();
const arch = process.arch;
const BASE_URL = 'https://files.astrofox.io/ffmpeg';

const files = {
  win32: ['win', 'ffmpeg.exe'],
  darwin: ['mac', 'ffmpeg'],
  linux: ['linux', 'ffmpeg'],
};

if (!files[platform]) {
  console.error(`Unsupported platform for ffmpeg install: ${platform}`);
  process.exit(1);
}

const [dir, file] = files[platform];
const dest = path.join(destDir, file);

// Candidate URLs in priority order. On Apple Silicon try a native build first
// and fall back to the x64 build (runs under Rosetta).
const candidates = [];
if (platform === 'darwin' && arch === 'arm64') {
  candidates.push(`${BASE_URL}/mac-arm64/${file}`);
}
candidates.push(`${BASE_URL}/${dir}/${file}`);

fs.mkdirSync(destDir, { recursive: true });

if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
  console.log(`ffmpeg already present: ${dest} (use --force to re-download)`);
  process.exit(0);
}

function download(url, target) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl, redirects = 0) => {
      https
        .get(currentUrl, res => {
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            res.resume();
            if (redirects > 5) {
              reject(new Error('Too many redirects'));
              return;
            }
            request(new URL(res.headers.location, currentUrl).toString(), redirects + 1);
            return;
          }
          if (res.statusCode !== 200) {
            res.resume();
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          const stream = fs.createWriteStream(target);
          res.pipe(stream);
          stream.on('error', reject);
          stream.on('finish', () => stream.close(resolve));
        })
        .on('error', reject);
    };
    request(url);
  });
}

const tmp = `${dest}.download`;
let downloaded = false;
let lastError;

for (const url of candidates) {
  console.log(`Downloading ${url} -> ${dest}`);
  try {
    await download(url, tmp);
    const size = fs.existsSync(tmp) ? fs.statSync(tmp).size : 0;
    if (size === 0) {
      throw new Error('downloaded file is empty');
    }
    downloaded = true;
    break;
  } catch (err) {
    lastError = err;
    console.warn(`Failed to download ${url}: ${err.message}`);
    if (fs.existsSync(tmp)) {
      fs.rmSync(tmp, { force: true });
    }
  }
}

if (!downloaded) {
  console.error(
    `ffmpeg install failed (${lastError?.message ?? 'unknown error'}). ` +
      'Desktop export requires a bundled ffmpeg binary; aborting.',
  );
  process.exit(1);
}

fs.renameSync(tmp, dest);
if (platform !== 'win32') {
  fs.chmodSync(dest, 0o755);
}

const { size } = fs.statSync(dest);
console.log(`ffmpeg installed: ${dest} (${(size / 1024 / 1024).toFixed(1)} MB)`);
