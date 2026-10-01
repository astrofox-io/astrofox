import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RenderFrameData } from '@/lib/types';
import { createFramePreparation, type FramePreparation } from './framePreparation';
import { createOfflineFrames, type OfflineFrames } from './offlineFrames';

let log: string[];
let preparation: FramePreparation;
let stageReady: boolean;
let mountOnDraw: (() => void) | null;
let offline: OfflineFrames;

function frame(time: number, fps: number) {
  return { time, fps, offline: true } as RenderFrameData;
}

beforeEach(() => {
  log = [];
  stageReady = true;
  mountOnDraw = null;
  preparation = createFramePreparation(50);
  offline = createOfflineFrames({
    ensureStage: async () => stageReady,
    fontsReady: async () => {
      log.push('fonts');
    },
    pauseLive: () => {
      log.push('pause');
      return () => log.push('resume');
    },
    frameAt: (time, fps) => {
      log.push(`frame ${time}@${fps}`);
      return frame(time, fps);
    },
    draw: async frameData => {
      log.push(`draw ${frameData.time}`);
      // A layer whose clip starts at this time mounts while drawing.
      const mount = mountOnDraw;
      mountOnDraw = null;
      mount?.();
    },
    readPixels: () => new Uint8Array([log.length]),
    preparation,
  });
});

describe('session', () => {
  it('pauses the live view, draws each frame and resumes', async () => {
    const pixels = await offline.session(30, async frames => [
      await frames.renderAt(1),
      await frames.renderAt(2),
    ]);

    expect(log).toEqual([
      'fonts',
      'pause',
      'frame 1@30',
      'draw 1',
      'frame 2@30',
      'draw 2',
      'resume',
    ]);
    expect(pixels).toHaveLength(2);
  });

  it('resumes the live view when the work fails', async () => {
    await expect(
      offline.session(30, async () => {
        throw new Error('ffmpeg died');
      }),
    ).rejects.toThrow('ffmpeg died');

    expect(log.at(-1)).toBe('resume');
  });

  it('refuses to start without a stage, leaving the live view alone', async () => {
    stageReady = false;

    await expect(offline.session(30, async () => 'never')).rejects.toThrow(
      'Stage renderer is not ready.',
    );
    expect(log).toEqual([]);
  });

  it('runs sessions one at a time, in order', async () => {
    let release = () => {};
    let started = () => {};
    const firstStarted = new Promise<void>(resolve => {
      started = resolve;
    });
    const first = offline.session(30, async frames => {
      await new Promise<void>(resolve => {
        release = resolve;
        started();
      });
      await frames.renderAt(1);
    });
    const second = offline.session(60, frames => frames.renderAt(5));

    // The first session holds the stage; the second waits its turn.
    await firstStarted;
    expect(log).toEqual(['fonts', 'pause']);

    release();
    await Promise.all([first, second]);

    expect(log).toEqual([
      'fonts',
      'pause',
      'frame 1@30',
      'draw 1',
      'resume',
      'fonts',
      'pause',
      'frame 5@60',
      'draw 5',
      'resume',
    ]);
  });

  it('still runs a session after the one before it failed', async () => {
    const failed = offline.session(30, async () => {
      throw new Error('boom');
    });

    await expect(failed).rejects.toThrow('boom');
    await expect(offline.session(30, async () => 'ok')).resolves.toBe('ok');
  });
});

describe('renderAt', () => {
  it('prepares every mounted layer for the frame before drawing it', async () => {
    preparation.register(async frameData => {
      log.push(`seek video to ${frameData.time}`);
    });

    await offline.session(30, frames => frames.renderAt(3));

    expect(log).toEqual(['fonts', 'pause', 'frame 3@30', 'seek video to 3', 'draw 3', 'resume']);
  });

  it('draws again once a layer that mounted during the frame is ready', async () => {
    const existing = vi.fn();
    preparation.register(existing);
    mountOnDraw = () =>
      preparation.register(async frameData => {
        log.push(`prepare new layer for ${frameData.time}`);
      });

    await offline.session(30, frames => frames.renderAt(4));

    expect(log).toEqual([
      'fonts',
      'pause',
      'frame 4@30',
      'draw 4',
      'prepare new layer for 4',
      'draw 4',
      'resume',
    ]);
    // Layers that were already prepared are not prepared twice.
    expect(existing).toHaveBeenCalledTimes(1);
  });

  it('does not wait forever for a layer that never gets ready', async () => {
    preparation.register(() => new Promise(() => {}));

    await offline.session(30, frames => frames.renderAt(1));

    expect(log).toContain('draw 1');
  });

  it('forgets a layer that unmounts', async () => {
    const preparer = vi.fn();
    const unregister = preparation.register(preparer);
    unregister();

    await offline.session(30, frames => frames.renderAt(1));

    expect(preparer).not.toHaveBeenCalled();
  });
});
