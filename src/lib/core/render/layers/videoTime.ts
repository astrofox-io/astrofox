export interface VideoTiming {
  /** Trim start in the media, seconds. */
  startTime?: unknown;
  /** Trim end in the media, seconds; 0 means the media's end. */
  endTime?: unknown;
  loop?: boolean;
  /** Media duration in seconds, once known. */
  duration?: number;
}

/**
 * The media time a video display shows at project time `time`: the trimmed
 * range played from the project start, looping or holding its last frame.
 */
export function videoTimeAt(time: number, { startTime, endTime, loop, duration }: VideoTiming) {
  const clipStart = Math.max(0, Number(startTime) || 0);
  const explicitEnd = Number(endTime) || 0;
  const mediaDuration = Number(duration) || 0;
  const clipEnd =
    explicitEnd > clipStart ? explicitEnd : mediaDuration > clipStart ? mediaDuration : 0;
  const elapsed = Math.max(0, Number(time) || 0);

  let next = clipStart + elapsed;

  if (clipEnd > clipStart) {
    next = loop ? clipStart + (elapsed % (clipEnd - clipStart)) : Math.min(next, clipEnd);
  }

  if (mediaDuration > 0) {
    next = Math.min(next, mediaDuration);
  }

  return Number.isFinite(next) ? next : clipStart;
}
