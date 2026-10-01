import { type ChildProcess, spawn } from 'node:child_process';
import fs from 'node:fs';
import type { BrowserWindow, IpcMain } from 'electron';
import { toBuffer } from './bytes';
import { handle } from './ipc';

/** Start ffmpeg with `args`, reading frames from stdin when `pipe` is true. */
export type SpawnFfmpeg = (args: string[], pipe: boolean) => ChildProcess;

interface Exit {
  code: number | null;
  signal: NodeJS.Signals | null;
  stderr: string;
  error: Error | null;
}

interface Managed {
  proc: ChildProcess;
  exit: Promise<Exit>;
  stderr(): string;
  error(): Error | null;
  done(): boolean;
}

const STDERR_LIMIT = 200_000;
const STDERR_TAIL_LENGTH = 4000;
const KILL_GRACE_MS = 3000;

function stderrTail(stderr: string) {
  const trimmed = (stderr || '').trim();
  return trimmed.length > STDERR_TAIL_LENGTH ? trimmed.slice(-STDERR_TAIL_LENGTH) : trimmed;
}

function failed(result: Exit) {
  return Boolean(result.error) || result.code !== 0;
}

function describeExit(result: Exit) {
  if (result.error) {
    const tail = stderrTail(result.stderr);
    return `ffmpeg failed: ${result.error.message}${tail ? `\n${tail}` : ''}`;
  }

  return (
    stderrTail(result.stderr) ||
    `ffmpeg exited with code ${result.code}${result.signal ? ` signal ${result.signal}` : ''}`
  );
}

function manage(proc: ChildProcess): Managed {
  let stderr = '';
  let error: Error | null = null;
  let done = false;

  proc.stderr?.on('data', chunk => {
    stderr += chunk.toString();
    if (stderr.length > STDERR_LIMIT) {
      stderr = stderr.slice(-STDERR_LIMIT / 2);
    }
  });

  // Without a listener, an EPIPE after ffmpeg exits early would be an unhandled
  // 'error' event and crash the main process. Record it for the next write.
  proc.stdin?.on('error', stdinError => {
    error ??= stdinError;
  });

  const exit = new Promise<Exit>(resolve => {
    const finish = () => {
      if (done) return;
      done = true;
      resolve({ code: proc.exitCode, signal: proc.signalCode, stderr, error });
    };

    proc.on('close', finish);
    // Spawn failures (ENOENT, EACCES) may never be followed by 'close'.
    proc.on('error', spawnError => {
      error = spawnError;
      finish();
    });
  });

  return {
    proc,
    exit,
    stderr: () => stderr,
    error: () => error,
    done: () => done,
  };
}

function kill(managed: Managed) {
  if (managed.done()) return;

  try {
    managed.proc.stdin?.destroy();
  } catch {
    // Already closed.
  }

  try {
    managed.proc.kill('SIGTERM');
  } catch {
    // Already gone.
  }

  // ffmpeg normally exits promptly on SIGTERM; escalate if it does not.
  const timer = setTimeout(() => {
    if (!managed.done()) {
      try {
        managed.proc.kill('SIGKILL');
      } catch {
        // Already gone.
      }
    }
  }, KILL_GRACE_MS);
  timer.unref?.();
}

/** Write to stdin, waiting for it to drain when its buffer is full. */
function writeStdin(managed: Managed, data: Buffer) {
  const stdin = managed.proc.stdin;

  if (!stdin || stdin.destroyed || stdin.writableEnded) {
    return Promise.reject(
      new Error(`ffmpeg stdin is closed\n${stderrTail(managed.stderr())}`.trim()),
    );
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const settle = (error?: Error | null) => {
      if (settled) return;
      settled = true;
      stdin.off('error', settle);
      stdin.off('drain', onDrain);
      if (error) {
        reject(
          new Error(
            `ffmpeg write failed: ${error.message}\n${stderrTail(managed.stderr())}`.trim(),
          ),
        );
      } else {
        resolve();
      }
    };
    const onDrain = () => settle();

    stdin.once('error', settle);

    if (stdin.write(data, error => error && settle(error))) {
      settle();
    } else {
      stdin.once('drain', onDrain);
    }
  });
}

/**
 * The ffmpeg processes of video exports, grouped by export job. A job has at
 * most one pipe (raw frames on stdin) and any number of one-shot runs.
 * Cancelling a job kills every process it has and refuses any it asks for
 * afterwards, so a cancel cannot be outrun by the next stage.
 */
export interface FfmpegJobs {
  /** Run ffmpeg to completion. Rejects with the end of its stderr when it fails. */
  run(job: string, args: string[]): Promise<void>;
  /** Start the job's pipe. */
  startPipe(job: string, args: string[]): void;
  /** Write frame bytes to the job's pipe, waiting while ffmpeg catches up. */
  write(job: string, data: Buffer): Promise<void>;
  /** Close the job's pipe and wait for ffmpeg to finish. */
  endPipe(job: string): Promise<void>;
  /** Kill every process of the job. */
  cancel(job: string): void;
  /** Kill every process of every job: the app is quitting, or the window reloaded. */
  cancelAll(): void;
}

interface Job {
  pipe: Managed | null;
  processes: Set<Managed>;
}

export function createFfmpegJobs(spawnFfmpeg: SpawnFfmpeg): FfmpegJobs {
  const jobs = new Map<string, Job>();
  const cancelled = new Set<string>();

  function jobOf(id: string) {
    if (cancelled.has(id)) {
      throw new Error('Export cancelled.');
    }

    let job = jobs.get(id);
    if (!job) {
      job = { pipe: null, processes: new Set() };
      jobs.set(id, job);
    }
    return job;
  }

  function forgetIfIdle(id: string, job: Job) {
    if (jobs.get(id) === job && !job.pipe && job.processes.size === 0) {
      jobs.delete(id);
    }
  }

  function start(id: string, args: string[], pipe: boolean) {
    if (cancelled.has(id)) {
      throw new Error('Export cancelled.');
    }

    const managed = manage(spawnFfmpeg(args.map(String), pipe));
    const job = jobOf(id);

    job.processes.add(managed);
    void managed.exit.then(() => {
      job.processes.delete(managed);
      forgetIfIdle(id, job);
    });

    return { job, managed };
  }

  function pipeOf(id: string) {
    const pipe = jobs.get(id)?.pipe;
    if (!pipe) {
      throw new Error(`No ffmpeg pipe for export ${id}.`);
    }
    return pipe;
  }

  function cancel(id: string) {
    cancelled.add(id);
    const job = jobs.get(id);
    jobs.delete(id);

    for (const managed of job?.processes ?? []) {
      kill(managed);
    }
  }

  return {
    async run(id, args) {
      const { managed } = start(id, args, false);
      const result = await managed.exit;

      if (failed(result)) {
        throw new Error(describeExit(result));
      }
    },

    startPipe(id, args) {
      if (jobs.get(id)?.pipe) {
        throw new Error(`Export ${id} already has an ffmpeg pipe.`);
      }

      const { job, managed } = start(id, args, true);
      job.pipe = managed;
    },

    async write(id, data) {
      const pipe = pipeOf(id);

      // ffmpeg exited (bad arguments, a full disk) or its stdin broke.
      if (pipe.done() || pipe.error()) {
        kill(pipe);
        throw new Error(describeExit(await pipe.exit));
      }

      await writeStdin(pipe, data);
    },

    async endPipe(id) {
      const pipe = pipeOf(id);
      const stdin = pipe.proc.stdin;

      if (stdin && !stdin.destroyed && !stdin.writableEnded) {
        await new Promise<void>(resolve => stdin.end(() => resolve()));
      }

      const result = await pipe.exit;
      const job = jobs.get(id);

      if (job?.pipe === pipe) {
        job.pipe = null;
        forgetIfIdle(id, job);
      }

      if (failed(result)) {
        throw new Error(describeExit(result));
      }
    },

    cancel,

    cancelAll() {
      for (const id of [...jobs.keys()]) {
        cancel(id);
      }
      cancelled.clear();
    },
  };
}

/** Spawn the bundled ffmpeg binary. */
function spawnBinary(getFfmpegPath: () => string): SpawnFfmpeg {
  return (args, pipe) => {
    const ffmpegPath = getFfmpegPath();

    if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
      throw new Error(`ffmpeg binary not found at: ${ffmpegPath || '(empty)'}`);
    }

    return spawn(ffmpegPath, args, {
      stdio: [pipe ? 'pipe' : 'ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
  };
}

/**
 * The `ffmpeg:*` channels (`Encoder` in src/lib/platform/desktop.ts). Returns
 * the jobs, so the app can kill them when it quits or the window reloads.
 */
export function registerFfmpegIpc(
  ipcMain: IpcMain,
  getWindow: () => BrowserWindow | null,
  deps: { getFfmpegPath: () => string },
): FfmpegJobs {
  const jobs = createFfmpegJobs(spawnBinary(deps.getFfmpegPath));

  handle(ipcMain, getWindow, {
    'ffmpeg:run': ({ job, args }) => jobs.run(String(job), args),
    'ffmpeg:start-pipe': ({ job, args }) => jobs.startPipe(String(job), args),
    'ffmpeg:write': ({ job, data }) => jobs.write(String(job), toBuffer(data)),
    'ffmpeg:end-pipe': ({ job }) => jobs.endPipe(String(job)),
    'ffmpeg:cancel': ({ job }) => jobs.cancel(String(job)),
  });

  return jobs;
}
