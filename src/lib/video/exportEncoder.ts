import type { ExportPlan } from './exportPlan';

/** Where an export has got to. MCP reports this as a job's `progress`. */
export type ExportProgress = {
  status:
    | 'preparing'
    | 'rendering-video'
    | 'rendering-audio'
    | 'merging'
    | 'recording'
    | 'saving'
    | 'finished';
  currentFrame?: number;
  totalFrames?: number;
  /** Project time reached, in seconds. */
  time?: number;
};

/**
 * Turns a checked plan into a video file. Two adapters:
 *
 * - offline (`offlineEncoder.ts`): renders each frame at its project time and
 *   pipes it to ffmpeg;
 * - realtime (`realtimeEncoder.ts`): records the stage canvas with
 *   MediaRecorder while the transport plays the range.
 *
 * The export job (`src/app/actions/export.ts`) drives whichever one the
 * machine supports; nothing else runs an encoder.
 */
export interface ExportEncoder {
  /** Produce the video. Resolves with the saved path or file name. */
  run(plan: ExportPlan, onProgress: (progress: ExportProgress) => void): Promise<string>;
  /**
   * End the export early. Offline discards the partial file and rejects with
   * an ExportCancelledError; realtime stops recording and saves what it has.
   */
  cancel(): void;
}

export class ExportCancelledError extends Error {
  readonly cancelled = true;

  constructor() {
    super('Export cancelled.');
    this.name = 'ExportCancelledError';
  }
}

export function isExportCancelledError(error: unknown): boolean {
  return (
    error instanceof ExportCancelledError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { cancelled?: boolean }).cancelled === true)
  );
}
