import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { BrowserWindow, IpcMain } from 'electron';
import { toBuffer } from './bytes';
import { handle } from './ipc';

const TRANSIENT_UNLINK_ERROR_CODES = new Set(['EBUSY', 'EPERM']);
const UNLINK_RETRY_ATTEMPTS = 10;
const UNLINK_RETRY_DELAY_MS = 100;

function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/** Delete a file, retrying while Windows still holds it (an ffmpeg that has just exited). */
async function unlinkWithRetry(target: string) {
  for (let attempt = 0; attempt < UNLINK_RETRY_ATTEMPTS; attempt += 1) {
    try {
      await fs.promises.unlink(target);
      return true;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code;

      if (code === 'ENOENT') {
        return true;
      }

      if (!code || !TRANSIENT_UNLINK_ERROR_CODES.has(code)) {
        throw error;
      }

      if (attempt < UNLINK_RETRY_ATTEMPTS - 1) {
        await wait(UNLINK_RETRY_DELAY_MS);
      }
    }
  }

  return false;
}

/**
 * True when `target` is `root` itself or lives inside it. Case-insensitive on
 * Windows, where the file system is.
 */
export function isPathInside(root: string, target: string) {
  let resolvedRoot = path.resolve(root);
  let resolvedTarget = path.resolve(target);

  if (process.platform === 'win32') {
    resolvedRoot = resolvedRoot.toLowerCase();
    resolvedTarget = resolvedTarget.toLowerCase();
  }

  const relative = path.relative(resolvedRoot, resolvedTarget);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/**
 * Files by absolute path for the app window (`NativeFiles` in
 * src/lib/platform/desktop.ts): reading and writing anywhere, and temp files
 * that can only be deleted from the app's temp directory.
 */
export function registerFileIpc(
  ipcMain: IpcMain,
  getWindow: () => BrowserWindow | null,
  deps: { getTempPath: () => string },
) {
  return handle(ipcMain, getWindow, {
    'desktop:write-temp-file': async ({ name, data }) => {
      const tempRoot = deps.getTempPath();
      await fs.promises.mkdir(tempRoot, { recursive: true });
      const filePath = path.join(
        tempRoot,
        typeof name === 'string' && name ? path.basename(name) : `${randomUUID()}.bin`,
      );
      await fs.promises.writeFile(filePath, toBuffer(data));
      return { filePath };
    },

    'desktop:remove-path': async ({ filePath }) => {
      const tempRoot = path.resolve(deps.getTempPath());
      const target = path.resolve(String(filePath || ''));

      if (!filePath || target === tempRoot || !isPathInside(tempRoot, target)) {
        throw new Error('Refusing to delete path outside temp directory');
      }

      return { ok: await unlinkWithRetry(target) };
    },

    'desktop:write-file': async ({ filePath, data }) => {
      const target = String(filePath || '');

      if (!target || !path.isAbsolute(target)) {
        throw new Error(`Invalid file path: ${target || '(empty)'}`);
      }

      await fs.promises.mkdir(path.dirname(target), { recursive: true });
      await fs.promises.writeFile(target, toBuffer(data));
      return { ok: true, filePath: target };
    },

    'desktop:read-file': async ({ filePath }) => {
      const target = String(filePath || '');
      const stat = target ? await fs.promises.stat(target).catch(() => null) : null;

      if (!stat?.isFile()) {
        throw new Error(`File not found: ${target}`);
      }

      return { name: path.basename(target), data: await fs.promises.readFile(target) };
    },
  });
}
