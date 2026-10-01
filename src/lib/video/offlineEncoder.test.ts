import { beforeEach, describe, expect, it } from 'vitest';
import type { OfflineFrameSession } from '@/lib/core/render/offlineFrames';
import type { Encoder } from '@/lib/platform/types';
import { type ExportProgress, isExportCancelledError } from './exportEncoder';
import type { ExportPlan } from './exportPlan';
import { createOfflineEncoder, type OfflineEncoderDeps } from './offlineEncoder';

interface Call {
  op: 'run' | 'startPipe' | 'write' | 'endPipe' | 'kill';
  id: string;
  args?: string[];
  bytes?: number;
}

let calls: Call[];
let rendered: number[];
let removed: string[];
let written: string[];
let audioFile: File | null;
let stage: { width: number; height: number };
let progress: ExportProgress[];
/** Called before each ffmpeg call resolves; throw to make it fail. */
let onCall: (call: Call) => void;

const ffmpeg: Encoder = {
  run: async (args, id) => record({ op: 'run', id, args }),
  startPipe: async (args, id) => record({ op: 'startPipe', id, args }),
  write: async (id, data) => record({ op: 'write', id, bytes: data.byteLength }),
  endPipe: async id => record({ op: 'endPipe', id }),
  kill: async id => {
    calls.push({ op: 'kill', id });
  },
};

function record(call: Call) {
  calls.push(call);
  onCall(call);
}

function plan(overrides: Partial<ExportPlan> = {}): ExportPlan {
  return {
    mode: 'offline',
    startTime: 1,
    endTime: 1.1,
    fps: 30,
    encoder: 'x264',
    quality: 'medium',
    includeAudio: true,
    overwrite: true,
    output: { path: 'C:\\videos\\out.mp4' },
    ...overrides,
  };
}

function audio(path?: string) {
  const file = new File(['audio bytes'], 'song.mp3');
  if (path) Object.assign(file, { path });
  return file;
}

function deps(): OfflineEncoderDeps {
  return {
    ffmpeg,
    files: {
      tempPath: 'C:\\temp\\',
      writeTemp: async name => {
        const path = `C:\\temp\\${name}`;
        written.push(path);
        return path;
      },
      removeTemp: async path => {
        removed.push(path);
        return true;
      },
    },
    getAudioFile: () => audioFile,
    stageSize: () => stage,
    render: async <T>(_fps: number, work: (frames: OfflineFrameSession) => Promise<T>) =>
      work({
        renderAt: async time => {
          rendered.push(time);
          return new Uint8Array(stage.width * stage.height * 4).fill(255);
        },
      }),
    yieldToUI: async () => {},
  };
}

function args(op: Call['op']) {
  return calls.find(call => call.op === op)?.args ?? [];
}

function stageArgs(id: string) {
  return calls.find(call => call.id.endsWith(id))?.args ?? [];
}

beforeEach(() => {
  calls = [];
  rendered = [];
  removed = [];
  written = [];
  progress = [];
  audioFile = audio('C:\\music\\song.mp3');
  stage = { width: 640, height: 360 };
  onCall = () => {};
});

async function run(exportPlan = plan()) {
  return createOfflineEncoder(deps()).run(exportPlan, next => progress.push(next));
}

describe('run', () => {
  it('renders every frame of the range at its project time', async () => {
    await run();

    expect(rendered.map(time => Math.round(time * 30))).toEqual([30, 31, 32]);
    expect(calls.filter(call => call.op === 'write')).toHaveLength(3);
  });

  it('pipes raw frames of the stage size to the encoder', async () => {
    await run();

    const video = args('startPipe');
    expect(video.slice(0, 10)).toEqual([
      '-y',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-s',
      '640x360',
      '-r',
      '30',
      '-i',
    ]);
    expect(video).toContain('libx264');
    expect(video).toEqual(expect.arrayContaining(['-preset', 'medium', '-crf', '20']));
    expect(calls.find(call => call.op === 'write')?.bytes).toBe(640 * 360 * 4);
  });

  it('pads an odd stage size to even dimensions', async () => {
    stage = { width: 641, height: 359 };

    await run();

    expect(args('startPipe')).toContain('642x360');
    expect(calls.find(call => call.op === 'write')?.bytes).toBe(642 * 360 * 4);
  });

  it('encodes the audio range and merges it with the video', async () => {
    const result = await run();

    expect(stageArgs('.audio')).toEqual(
      expect.arrayContaining(['-i', 'C:\\music\\song.mp3', '-ss', '1', '-t']),
    );
    const merge = stageArgs('.merge');
    expect(merge[0]).toBe('-y');
    expect(merge).toContain('-shortest');
    expect(merge.at(-1)).toBe('C:\\videos\\out.mp4');
    expect(result).toBe('C:\\videos\\out.mp4');
  });

  it('refuses to replace an existing file unless asked', async () => {
    await run(plan({ overwrite: false }));

    expect(stageArgs('.merge')[0]).toBe('-n');
  });

  it('skips the audio when the export has none', async () => {
    audioFile = null;

    await run(plan({ includeAudio: false }));

    expect(calls.some(call => call.id.endsWith('.audio'))).toBe(false);
    expect(stageArgs('.merge')).not.toContain('-shortest');
  });

  it('writes audio that has no path on disk to a temp file, and removes it', async () => {
    audioFile = audio();

    await run();

    expect(written).toHaveLength(1);
    expect(stageArgs('.audio')).toContain(written[0]);
    expect(removed).toContain(written[0]);
  });

  it('fails when the audio was unloaded after the export was planned', async () => {
    audioFile = null;

    await expect(run()).rejects.toThrow('The audio file is no longer loaded.');
    expect(calls).toEqual([]);
  });

  it("gives the output the encoder's extension", async () => {
    const result = await run(plan({ encoder: 'webm', output: { path: '/videos/out.mp4' } }));

    expect(result).toBe('/videos/out.webm');
  });

  it('reports progress through every phase', async () => {
    await run();

    expect(progress.map(({ status }) => status)).toEqual([
      'preparing',
      'rendering-video',
      'rendering-video',
      'rendering-video',
      'rendering-video',
      'rendering-audio',
      'merging',
      'finished',
    ]);
    expect(progress.at(-1)).toEqual({ status: 'finished', currentFrame: 3, totalFrames: 3 });
  });

  it('always removes its temp files', async () => {
    onCall = call => {
      if (call.op === 'run') throw new Error('ffmpeg exited with code 1');
    };

    await expect(run()).rejects.toThrow('ffmpeg exited with code 1');
    expect(removed.some(path => path.endsWith('.video.mp4'))).toBe(true);
    expect(removed.some(path => path.endsWith('.audio.m4a'))).toBe(true);
  });

  it('kills the encoder when rendering fails', async () => {
    const encoder = createOfflineEncoder({
      ...deps(),
      render: async () => {
        throw new Error('Stage renderer is not ready.');
      },
    });

    await expect(encoder.run(plan(), () => {})).rejects.toThrow('Stage renderer is not ready.');
    expect(calls.at(-1)).toMatchObject({ op: 'kill' });
  });
});

describe('cancel', () => {
  it('stops rendering, kills ffmpeg and rejects as cancelled', async () => {
    const encoder = createOfflineEncoder(deps());
    onCall = call => {
      if (call.op === 'write') encoder.cancel();
    };

    const error = await encoder.run(plan(), () => {}).catch(cause => cause);

    expect(isExportCancelledError(error)).toBe(true);
    expect(rendered).toHaveLength(1);
    expect(calls.some(call => call.op === 'kill')).toBe(true);
    expect(calls.some(call => call.id.endsWith('.merge'))).toBe(false);
  });

  it('reports a stage killed by the cancel as a cancel, not a failure', async () => {
    const encoder = createOfflineEncoder(deps());
    onCall = call => {
      if (call.id.endsWith('.audio')) {
        encoder.cancel();
        throw new Error('ffmpeg exited with code 255');
      }
    };

    const error = await encoder.run(plan(), () => {}).catch(cause => cause);

    expect(isExportCancelledError(error)).toBe(true);
  });
});
