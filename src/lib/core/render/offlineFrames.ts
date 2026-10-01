import type { RenderFrameData } from '@/lib/types';
import type { FramePreparation } from './framePreparation';

/** Draws offline frames within a session; see `OfflineFrames.session`. */
export interface OfflineFrameSession {
  /**
   * Draw project `time` with every layer ready for it, and resolve to the
   * frame's RGBA pixels (bottom row first). The stage canvas shows the frame
   * until the next one is drawn.
   */
  renderAt(time: number): Promise<Uint8Array>;
}

export interface OfflineFrames {
  /**
   * Render offline frames: export, previews at a time, saved images. The live
   * view pauses until `work` finishes, so nothing else draws between a frame
   * and reading it back, then catches up with the playhead. Sessions run one
   * at a time, in the order they were asked for.
   */
  session<T>(fps: number, work: (frames: OfflineFrameSession) => Promise<T>): Promise<T>;
}

export interface OfflineFrameDeps {
  /** Mount the stage renderer. False when there is no stage to draw on. */
  ensureStage(): Promise<boolean>;
  /** Resolves once web fonts have loaded, for text drawn on the stage. */
  fontsReady(): Promise<unknown>;
  /** Stop the live render loop; the returned function starts it again. */
  pauseLive(): () => void;
  /** The frame for project `time`, with the audio analysed at that time. */
  frameAt(time: number, fps: number): RenderFrameData;
  /** Draw a frame and resolve once it is presented. */
  draw(frameData: RenderFrameData): Promise<void>;
  /** The presented frame's RGBA pixels. */
  readPixels(): Uint8Array;
  preparation: FramePreparation;
}

export function createOfflineFrames(deps: OfflineFrameDeps): OfflineFrames {
  let queue: Promise<unknown> = Promise.resolve();

  async function renderAt(time: number, fps: number) {
    const frameData = deps.frameAt(time, fps);

    await deps.preparation.prepare(frameData);
    await deps.draw(frameData);

    // A layer that mounted while drawing (its clip starts here) drew unprepared.
    if (await deps.preparation.prepareNew(frameData)) {
      await deps.draw(frameData);
    }

    return deps.readPixels();
  }

  async function run<T>(fps: number, work: (frames: OfflineFrameSession) => Promise<T>) {
    if (!(await deps.ensureStage())) {
      throw new Error('Stage renderer is not ready.');
    }

    await deps.fontsReady();
    const resumeLive = deps.pauseLive();

    try {
      return await work({ renderAt: time => renderAt(time, fps) });
    } finally {
      resumeLive();
    }
  }

  return {
    session(fps, work) {
      const result = queue.then(() => run(fps, work));
      queue = result.catch(() => {});
      return result;
    },
  };
}
