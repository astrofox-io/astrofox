import { snapToFrame } from '@/lib/timeline/clip';
import { SNAP_DISTANCE } from './constants';

/**
 * Snap a time to the nearest candidate (other clip edges, the playhead)
 * within a few pixels, otherwise to a whole frame when frame snapping is on.
 */
export function snapTime(
  time: number,
  candidates: readonly number[],
  pixelsPerSecond: number,
  snapFrames: boolean,
  fps: number,
) {
  let best = Number.POSITIVE_INFINITY;
  let snapped = time;

  for (const candidate of candidates) {
    const distance = Math.abs(candidate - time) * pixelsPerSecond;

    if (distance <= SNAP_DISTANCE && distance < best) {
      best = distance;
      snapped = candidate;
    }
  }

  if (best < Number.POSITIVE_INFINITY) {
    return snapped;
  }

  return snapFrames ? snapToFrame(time, fps) : time;
}
