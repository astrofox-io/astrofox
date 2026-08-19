import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {{
 *   proc: import('node:child_process').ChildProcess,
 *   exit: Promise<{ code: number | null, signal: NodeJS.Signals | null, stderr: string, error: Error | null }>,
 *   getStderr: () => string,
 *   getError: () => Error | null,
 *   isDone: () => boolean,
 * }} ManagedProcess
 */

/** Pipe (stdin-fed) processes addressable by id from the renderer. */
/** @type {Map<string, ManagedProcess>} */
const processes = new Map();
/** Every live ffmpeg child (pipe + run jobs) so we can kill them on quit. */
/** @type {Map<string, ManagedProcess>} */
const allProcesses = new Map();

const TRANSIENT_UNLINK_ERROR_CODES = new Set(['EBUSY', 'EPERM']);
const UNLINK_RETRY_ATTEMPTS = 10;
const UNLINK_RETRY_DELAY_MS = 100;
const STDERR_TAIL_LENGTH = 4000;

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function unlinkWithRetry(target) {
  for (let attempt = 0; attempt < UNLINK_RETRY_ATTEMPTS; attempt += 1) {
    try {
      await fs.promises.unlink(target);
      return true;
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return true;
      }

      if (!TRANSIENT_UNLINK_ERROR_CODES.has(error?.code)) {
        throw error;
      }

      if (attempt === UNLINK_RETRY_ATTEMPTS - 1) {
        return false;
      }

      await wait(UNLINK_RETRY_DELAY_MS);
    }
  }

  return false;
}

/**
 * True when `target` is `root` itself or lives inside it. Case-insensitive on
 * Windows where the filesystem is.
 * @param {string} root
 * @param {string} target
 */
export function isPathInside(root, target) {
  let resolvedRoot = path.resolve(root);
  let resolvedTarget = path.resolve(target);
  if (process.platform === 'win32') {
    resolvedRoot = resolvedRoot.toLowerCase();
    resolvedTarget = resolvedTarget.toLowerCase();
  }
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative === '') {
    return true;
  }
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

function stderrTail(stderr) {
  const trimmed = (stderr || '').trim();
  return trimmed.length > STDERR_TAIL_LENGTH ? trimmed.slice(-STDERR_TAIL_LENGTH) : trimmed;
}

/**
 * @param {{ code: number | null, signal: NodeJS.Signals | null, stderr: string, error: Error | null }} result
 */
function describeExit(result) {
  if (result.error) {
    const tail = stderrTail(result.stderr);
    return `ffmpeg failed: ${result.error.message}${tail ? `\n${tail}` : ''}`;
  }
  return (
    stderrTail(result.stderr) ||
    `ffmpeg exited with code ${result.code}${result.signal ? ` signal ${result.signal}` : ''}`
  );
}

/**
 * @param {string} ffmpegPath
 * @param {string[]} args
 * @param {{ pipeStdin?: boolean }} [options]
 * @returns {ManagedProcess}
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
  let error = null;
  let done = false;

  proc.stderr?.on('data', chunk => {
    stderr += chunk.toString();
    // Keep stderr bounded
    if (stderr.length > 200_000) {
      stderr = stderr.slice(-100_000);
    }
  });

  // Persistent handler: without it an EPIPE after ffmpeg exits early would be
  // an unhandled 'error' event and crash the main process. Record it so the
  // next write/end rejects with something useful.
  proc.stdin?.on('error', stdinError => {
    if (!error) {
      error = stdinError;
    }
  });

  const exit = new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      done = true;
      resolve({ code: proc.exitCode, signal: proc.signalCode, stderr, error });
    };
    proc.on('close', finish);
    // 'error' fires for spawn failures (ENOENT, EACCES) or kill failures; a
    // 'close' may never follow, so settle here as well.
    proc.on('error', spawnError => {
      error = spawnError;
      finish();
    });
  });

  const managed = {
    proc,
    exit,
    getStderr: () => stderr,
    getError: () => error,
    isDone: () => done,
  };

  const trackingId = randomUUID();
  allProcesses.set(trackingId, managed);
  exit.finally(() => {
    allProcesses.delete(trackingId);
  });

  return managed;
}

/**
 * @param {ManagedProcess | undefined} managed
 */
function killManaged(managed) {
  if (!managed || managed.isDone()) return;
  try {
    managed.proc.stdin?.destroy();
  } catch {
    // ignore
  }
  try {
    managed.proc.kill('SIGTERM');
  } catch {
    // ignore
  }
  // ffmpeg normally exits promptly on SIGTERM; escalate if it doesn't.
  const timer = setTimeout(() => {
    if (!managed.isDone()) {
      try {
        managed.proc.kill('SIGKILL');
      } catch {
        // ignore
      }
    }
  }, 3000);
  timer.unref?.();
}

/** Kill every live ffmpeg child. Called on app quit. */
export function killAllFfmpeg() {
  for (const managed of allProcesses.values()) {
    killManaged(managed);
  }
  processes.clear();
}

/**
 * @param {import('electron').IpcMain} ipcMain
 * @param {{ getFfmpegPath: () => string, getTempPath: () => string }} deps
 */
export function registerFfmpegIpc(ipcMain, deps) {
  ipcMain.handle('ffmpeg:run', async (_event, payload = {}) => {
    const args = Array.isArray(payload.args) ? payload.args.map(String) : [];
    const id = typeof payload.id === 'string' && payload.id ? payload.id : randomUUID();

    if (processes.has(id)) {
      throw new Error(`ffmpeg process already exists: ${id}`);
    }

    const managed = spawnFfmpeg(deps.getFfmpegPath(), args, { pipeStdin: false });
    processes.set(id, managed);

    let result;
    try {
      result = await managed.exit;
    } finally {
      processes.delete(id);
    }

    if (result.error || result.code !== 0) {
      throw new Error(describeExit(result));
    }
    return { ok: true, id };
  });

  ipcMain.handle('ffmpeg:start-pipe', async (_event, payload = {}) => {
    const args = Array.isArray(payload.args) ? payload.args.map(String) : [];
    const id = typeof payload.id === 'string' && payload.id ? payload.id : randomUUID();

    if (processes.has(id)) {
      throw new Error(`ffmpeg process already exists: ${id}`);
    }

    const managed = spawnFfmpeg(deps.getFfmpegPath(), args, { pipeStdin: true });
    processes.set(id, managed);

    // If ffmpeg dies before the renderer ends the pipe (bad args, spawn
    // failure) drop the entry once nobody could still be waiting on it. The
    // end-pipe handler removes it itself on the normal path.
    managed.exit.then(result => {
      if (result.error) {
        // Keep it around briefly so write/end can report the error, then drop.
        setTimeout(() => {
          if (processes.get(id) === managed) processes.delete(id);
        }, 60_000).unref?.();
      }
    });

    return { id };
  });

  ipcMain.handle('ffmpeg:write', async (_event, payload = {}) => {
    const id = String(payload.id || '');
    const managed = processes.get(id);
    if (!managed?.proc?.stdin) {
      throw new Error(`Unknown ffmpeg pipe process: ${id}`);
    }

    if (managed.isDone() || managed.getError()) {
      // A stdin error without an exit means ffmpeg is wedged; don't wait on it.
      if (!managed.isDone()) {
        killManaged(managed);
      }
      const result = await managed.exit;
      processes.delete(id);
      throw new Error(describeExit(result));
    }

    const data = payload.data;
    const buffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from(data instanceof ArrayBuffer ? data : new Uint8Array(data));

    const stdin = managed.proc.stdin;
    if (stdin.destroyed || stdin.writableEnded) {
      throw new Error(`ffmpeg stdin is closed\n${stderrTail(managed.getStderr())}`.trim());
    }

    await new Promise((resolve, reject) => {
      const fail = error => {
        stdin.off('drain', onDrain);
        stdin.off('error', onError);
        reject(
          new Error(
            `ffmpeg write failed: ${error?.message || error}\n${stderrTail(managed.getStderr())}`.trim(),
          ),
        );
      };
      const onError = error => fail(error);
      const onDrain = () => {
        stdin.off('error', onError);
        resolve();
      };

      stdin.once('error', onError);

      const canContinue = stdin.write(buffer, error => {
        if (error) {
          fail(error);
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

    if (result.error || result.code !== 0) {
      throw new Error(describeExit(result));
    }

    return { ok: true };
  });

  ipcMain.handle('ffmpeg:kill', async (_event, payload = {}) => {
    const id = String(payload.id || '');
    const managed = processes.get(id);
    if (!managed) {
      return { ok: true };
    }
    processes.delete(id);
    killManaged(managed);
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
    const tempRoot = path.resolve(deps.getTempPath());
    const normalized = path.resolve(target);
    if (!target || normalized === tempRoot || !isPathInside(tempRoot, normalized)) {
      throw new Error('Refusing to delete path outside temp directory');
    }
    const removed = await unlinkWithRetry(normalized);
    return { ok: removed };
  });

  ipcMain.handle('desktop:write-file', async (_event, payload = {}) => {
    const target = String(payload.filePath || '');
    if (!target || !path.isAbsolute(target)) {
      throw new Error(`Invalid file path: ${target || '(empty)'}`);
    }
    const data = payload.data;
    const buffer = Buffer.isBuffer(data)
      ? data
      : typeof data === 'string'
        ? Buffer.from(data, 'utf8')
        : Buffer.from(data instanceof ArrayBuffer ? data : new Uint8Array(data));
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(target, buffer);
    return { ok: true, filePath: target };
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
