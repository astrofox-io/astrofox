import type { RenderFrameData } from '@/lib/types';

/** Gets a layer ready to draw an offline frame, e.g. seeks a video to it. */
export type FramePreparer = (frameData: RenderFrameData) => Promise<void> | void;

const PREPARE_TIMEOUT_MS = 5000;

const preparers = new Set<FramePreparer>();
let registeredSincePrepare = false;

/**
 * Register while a layer is mounted. Offline frames (export, previews at a
 * time) wait for every preparer before they are captured.
 */
export function registerFramePreparer(preparer: FramePreparer) {
  preparers.add(preparer);
  registeredSincePrepare = true;

  return () => {
    preparers.delete(preparer);
  };
}

function withTimeout(work: Promise<void> | void) {
  return Promise.race([
    Promise.resolve(work).catch(() => {}),
    new Promise<void>(resolve => setTimeout(resolve, PREPARE_TIMEOUT_MS)),
  ]);
}

/** Wait until every mounted layer is ready for this frame. */
export async function prepareFrame(frameData: RenderFrameData) {
  registeredSincePrepare = false;
  await Promise.all([...preparers].map(preparer => withTimeout(preparer(frameData))));
}

/**
 * Whether a layer mounted since the last `prepareFrame()`: it drew the frame
 * without being prepared (e.g. a video whose clip just started), so the frame
 * has to be prepared and drawn again.
 */
export function hasUnpreparedLayers() {
  return registeredSincePrepare;
}
