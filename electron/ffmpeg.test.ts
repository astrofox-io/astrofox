import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFfmpegJobs, type FfmpegJobs } from './ffmpeg';

/** A stand-in for an ffmpeg child process. */
class FakeFfmpeg extends EventEmitter {
  stdin: PassThrough | null;
  stderr = new PassThrough();
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;
  received = 0;
  killedWith: string[] = [];

  constructor(
    readonly args: string[],
    pipe: boolean,
  ) {
    super();
    this.stdin = pipe ? new PassThrough() : null;
    this.stdin?.on('data', chunk => {
      this.received += chunk.length;
    });
    // ffmpeg finishes once its input ends.
    this.stdin?.on('finish', () => this.exit(0));
  }

  exit(code: number, stderr = '') {
    if (stderr) this.stderr.write(stderr);
    setImmediate(() => {
      this.exitCode = code;
      this.emit('close');
    });
  }

  kill(signal: NodeJS.Signals) {
    this.killedWith.push(signal);
    setImmediate(() => {
      this.signalCode = signal;
      this.emit('close');
    });
    return true;
  }
}

let spawned: FakeFfmpeg[];
let jobs: FfmpegJobs;

beforeEach(() => {
  spawned = [];
  jobs = createFfmpegJobs((args, pipe) => {
    const ffmpeg = new FakeFfmpeg(args, pipe);
    spawned.push(ffmpeg);
    return ffmpeg as never;
  });
});

describe('run', () => {
  it('resolves when ffmpeg succeeds', async () => {
    const done = jobs.run('job', ['-i', 'a.wav', 'a.m4a']);
    spawned[0].exit(0);

    await expect(done).resolves.toBeUndefined();
    expect(spawned[0].args).toEqual(['-i', 'a.wav', 'a.m4a']);
  });

  it('rejects with the end of what ffmpeg printed when it fails', async () => {
    const done = jobs.run('job', ['-i', 'missing.wav']);
    spawned[0].exit(1, 'missing.wav: No such file or directory');

    await expect(done).rejects.toThrow('missing.wav: No such file or directory');
  });
});

describe('pipe', () => {
  it('feeds frames to ffmpeg and waits for it to finish', async () => {
    jobs.startPipe('job', ['-i', 'pipe:0', 'out.mp4']);
    await jobs.write('job', Buffer.alloc(16));
    await jobs.write('job', Buffer.alloc(16));

    await expect(jobs.endPipe('job')).resolves.toBeUndefined();
    expect(spawned[0].received).toBe(32);
  });

  it('allows one pipe per job', () => {
    jobs.startPipe('job', []);

    expect(() => jobs.startPipe('job', [])).toThrow('already has an ffmpeg pipe');
    expect(() => jobs.startPipe('other', [])).not.toThrow();
  });

  it('reports why ffmpeg stopped when a frame is written after it exited', async () => {
    jobs.startPipe('job', []);
    spawned[0].exit(1, 'Invalid argument');
    await new Promise(resolve => setImmediate(resolve));

    await expect(jobs.write('job', Buffer.alloc(4))).rejects.toThrow('Invalid argument');
  });

  it('refuses frames for a job without a pipe', async () => {
    await expect(jobs.write('nothing', Buffer.alloc(4))).rejects.toThrow('No ffmpeg pipe');
  });
});

describe('cancel', () => {
  it("kills every process of the job, and only that job's", async () => {
    jobs.startPipe('job', []);
    const stage = jobs.run('job', ['audio']);
    jobs.startPipe('other', []);

    jobs.cancel('job');

    await expect(stage).rejects.toThrow('signal SIGTERM');
    expect(spawned[0].killedWith).toEqual(['SIGTERM']);
    expect(spawned[1].killedWith).toEqual(['SIGTERM']);
    expect(spawned[2].killedWith).toEqual([]);
  });

  it('refuses anything the job starts afterwards', async () => {
    jobs.cancel('job');

    await expect(jobs.run('job', ['merge'])).rejects.toThrow('Export cancelled.');
    expect(() => jobs.startPipe('job', [])).toThrow('Export cancelled.');
    expect(spawned).toEqual([]);
  });

  it('kills every job when the window reloads or the app quits', () => {
    jobs.startPipe('a', []);
    jobs.startPipe('b', []);

    jobs.cancelAll();

    expect(spawned.map(ffmpeg => ffmpeg.killedWith)).toEqual([['SIGTERM'], ['SIGTERM']]);
  });
});
