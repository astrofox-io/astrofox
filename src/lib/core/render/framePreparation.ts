import type { RenderFrameData } from '@/lib/types';

/** Gets a layer ready to draw an offline frame, e.g. seeks a video to it. */
export type FramePreparer = (frameData: RenderFrameData) => Promise<void> | void;

const PREPARE_TIMEOUT_MS = 5000;

/** The layers waiting to be made ready for offline frames. */
export interface FramePreparation {
  /** Register while a layer is mounted; returns the unregister function. */
  register(preparer: FramePreparer): () => void;
  /** Make every mounted layer ready for this frame. */
  prepare(frameData: RenderFrameData): Promise<void>;
  /**
   * Make ready the layers that mounted since the last `prepare` or
   * `prepareNew`: they drew this frame unprepared (a video whose clip just
   * started), so the frame has to be drawn again. Returns false if there were none.
   */
  prepareNew(frameData: RenderFrameData): Promise<boolean>;
}

function withTimeout(work: Promise<void> | void, timeout: number) {
  return Promise.race([
    Promise.resolve(work).catch(() => {}),
    new Promise<void>(resolve => setTimeout(resolve, timeout)),
  ]);
}

/** A slow or failing layer is given `timeout` ms, then the frame goes ahead without it. */
export function createFramePreparation(timeout = PREPARE_TIMEOUT_MS): FramePreparation {
  const preparers = new Set<FramePreparer>();
  const unprepared = new Set<FramePreparer>();

  function run(list: FramePreparer[], frameData: RenderFrameData) {
    return Promise.all(list.map(preparer => withTimeout(preparer(frameData), timeout)));
  }

  return {
    register(preparer) {
      preparers.add(preparer);
      unprepared.add(preparer);

      return () => {
        preparers.delete(preparer);
        unprepared.delete(preparer);
      };
    },
    async prepare(frameData) {
      unprepared.clear();
      await run([...preparers], frameData);
    },
    async prepareNew(frameData) {
      if (unprepared.size === 0) {
        return false;
      }

      const list = [...unprepared];
      unprepared.clear();
      await run(list, frameData);
      return true;
    },
  };
}

/** The stage's layers. */
export const framePreparation = createFramePreparation();

/**
 * Register while a layer is mounted. Offline frames (export, previews at a
 * time, saved images) wait for every preparer before they are captured.
 */
export function registerFramePreparer(preparer: FramePreparer) {
  return framePreparation.register(preparer);
}
