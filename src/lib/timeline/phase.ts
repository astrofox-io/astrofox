/**
 * The largest step in project time between two frames that still counts as
 * continuous playback. Larger steps, and any step backwards, are jumps
 * (a seek, a loop, an export or preview starting somewhere else).
 */
export const MAX_CONTINUOUS_STEP = 0.25;

/**
 * A value that advances with project time, for animation that runs at a rate
 * (an effect's speed, a tunnel's travel) instead of reading `time` directly.
 *
 * - At a constant rate the value is exactly `rate * time`, however that time
 *   was reached: live playback, export at any frame rate, a preview or a seek.
 * - When the rate changes over time (a speed driven by a reactor) the value
 *   integrates it, so motion speeds up and slows down smoothly. It restarts
 *   from `rate * time` after a jump.
 * - Rendering the same time again (paused, redraws) does not move it.
 */
export class Phase {
  value = 0;

  private time: number | null = null;

  /** Advance to project time `time` (seconds) at `rate` units per second. */
  at(time: number, rate: number): number {
    const step = this.time === null ? Number.NaN : time - this.time;

    if (step > 0 && step <= MAX_CONTINUOUS_STEP) {
      this.value += rate * step;
    } else if (step !== 0) {
      this.value = rate * time;
    }

    this.time = time;

    return this.value;
  }
}
