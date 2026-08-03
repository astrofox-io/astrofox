import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** @typedef {{ proc: import('node:child_process').ChildProcessWithoutNullStreams, exit: Promise<{ code: number | null, signal: NodeJS.Signals | null, stderr: string }> }} ManagedProcess */

/** @type {Map<string, ManagedProcess>} */
const processes = new Map();

/**
 * @param {string} ffmpegPath
 * @param {string[]} args
 * @param {{ pipeStdin?: boolean }} [options]
 */
function spawnFfmpeg(ffmpegPath, args, options = {}) {
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
    throw new Error(`ffmpeg binary not found at: ${ffmpegPath || '(empty)'}`);
  }

  const proc = spawn(ffmpegPath, args, {
    stdio: [options.pipeStdin ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let stderr = '';
  proc.stderr?.on('data', chunk => {
    stderr += chunk.toString();
    // Keep stderr bounded
    if (stderr.length > 200_000) {
      stderr = stderr.slice(-100_000);
    }
  });

  const exit = new Promise(resolve => {
    proc.on('close', (code, signal) => {
      resolve({ code, signal, stderr });
    });
  });

  return { proc, exit };
}

/**
 * @param {import('electron').IpcMain} ipcMain
 * @param {{ getFfmpegPath: () => string, getTempPath: () => string }} deps
 */
export function registerFfmpegIpc(ipcMain, deps) {
  ipcMain.handle('ffmpeg:run', async (_event, payload = {}) => {
    const args = Array.isArray(payload.args) ? payload.args.map(String) : [];
    const { exit } = spawnFfmpeg(deps.getFfmpegPath(), args, {
      pipeStdin: false,
    });
    const result = await exit;
    if (result.code !== 0) {
      const message =
        result.stderr?.trim() ||
        `ffmpeg exited with code ${result.code}${result.signal ? ` signal ${result.signal}` : ''}`;
      throw new Error(message);
    }
    return { ok: true };
  });

  ipcMain.handle('ffmpeg:start-pipe', async (_event, payload = {}) => {
    const args = Array.isArray(payload.args) ? payload.args.map(String) : [];
    const id = typeof payload.id === 'string' && payload.id ? payload.id : randomUUID();

    if (processes.has(id)) {
      throw new Error(`ffmpeg process already exists: ${id}`);
    }

    const managed = spawnFfmpeg(deps.getFfmpegPath(), args, { pipeStdin: true });
    processes.set(id, managed);

    // Detach waiter so we can still call wait later
    managed.exit.finally(() => {
      // leave entry until wait/kill cleans up
    });

    return { id };
  });

  ipcMain.handle('ffmpeg:write', async (_event, payload = {}) => {
    const id = String(payload.id || '');
    const managed = processes.get(id);
    if (!managed?.proc?.stdin) {
      throw new Error(`Unknown ffmpeg pipe process: ${id}`);
    }

    const data = payload.data;
    const buffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from(data instanceof ArrayBuffer ? data : new Uint8Array(data));

    const stdin = managed.proc.stdin;
    if (stdin.destroyed || stdin.writableEnded) {
      throw new Error('ffmpeg stdin is closed');
    }

    await new Promise((resolve, reject) => {
      const onError = error => {
        stdin.off('drain', onDrain);
        reject(error);
      };
      const onDrain = () => {
        stdin.off('error', onError);
        resolve();
      };

      stdin.once('error', onError);

      const canContinue = stdin.write(buffer, error => {
        if (error) {
          stdin.off('drain', onDrain);
          stdin.off('error', onError);
          reject(error);
        }
      });

      if (canContinue) {
        stdin.off('error', onError);
        resolve();
      } else {
        stdin.once('drain', onDrain);
      }
    });

    return { ok: true, bytes: buffer.byteLength };
  });

  ipcMain.handle('ffmpeg:end-pipe', async (_event, payload = {}) => {
    const id = String(payload.id || '');
    const managed = processes.get(id);
    if (!managed) {
      throw new Error(`Unknown ffmpeg pipe process: ${id}`);
    }

    await new Promise(resolve => {
      const stdin = managed.proc.stdin;
      if (!stdin || stdin.destroyed || stdin.writableEnded) {
        resolve();
        return;
      }
      stdin.end(() => resolve());
    });

    const result = await managed.exit;
    processes.delete(id);

    if (result.code !== 0) {
      const message =
        result.stderr?.trim() ||
        `ffmpeg exited with code ${result.code}${result.signal ? ` signal ${result.signal}` : ''}`;
      throw new Error(message);
    }

    return { ok: true };
  });

  ipcMain.handle('ffmpeg:kill', async (_event, payload = {}) => {
    const id = String(payload.id || '');
    const managed = processes.get(id);
    if (!managed) {
      return { ok: true };
    }
    try {
      managed.proc.kill('SIGTERM');
    } catch {
      // ignore
    }
    processes.delete(id);
    return { ok: true };
  });

  ipcMain.handle('desktop:write-temp-file', async (_event, payload = {}) => {
    const tempRoot = deps.getTempPath();
    fs.mkdirSync(tempRoot, { recursive: true });
    const name =
      typeof payload.name === 'string' && payload.name
        ? path.basename(payload.name)
        : `${randomUUID()}.bin`;
    const filePath = path.join(tempRoot, name);
    const data = payload.data;
    const buffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from(data instanceof ArrayBuffer ? data : new Uint8Array(data));
    fs.writeFileSync(filePath, buffer);
    return { filePath };
  });

  ipcMain.handle('desktop:remove-path', async (_event, payload = {}) => {
    const target = String(payload.filePath || '');
    const tempRoot = path.normalize(deps.getTempPath());
    const normalized = path.normalize(target);
    if (!normalized.startsWith(tempRoot)) {
      throw new Error('Refusing to delete path outside temp directory');
    }
    try {
      fs.unlinkSync(normalized);
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
    return { ok: true };
  });

  ipcMain.handle('desktop:read-file', async (_event, payload = {}) => {
    const target = String(payload.filePath || '');
    if (!target || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      throw new Error(`File not found: ${target}`);
    }
    const data = fs.readFileSync(target);
    const name = path.basename(target);
    return {
      name,
      data,
    };
  });
}
