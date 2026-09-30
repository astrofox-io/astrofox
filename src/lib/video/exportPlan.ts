import { isValidFps, type TimelineFps } from '@/lib/timeline/settings';
import { VIDEO_ENCODERS, VIDEO_QUALITIES, type VideoEncoder, type VideoQuality } from './encoders';

/**
 * How a video export runs:
 *
 * - `offline`: frames are rendered one at a time at their project time and
 *   piped to ffmpeg (desktop, when ffmpeg is installed). Needs a real path.
 * - `realtime`: the stage canvas is recorded with MediaRecorder while the
 *   transport plays the range (the browser, or a desktop without ffmpeg).
 */
export type ExportMode = 'offline' | 'realtime';

/** A File System Access handle to write the video to. */
export interface ExportFileHandle {
  name: string;
  createWritable: () => Promise<{
    write: (blob: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
  getFile: () => Promise<File>;
}

/** Where the video goes: an absolute path, a File System Access handle, or a download name. */
export interface ExportOutput {
  path?: string;
  handle?: ExportFileHandle | null;
  /** Used for a download when there is neither a path nor a handle. */
  name?: string;
}

/** What a caller asks for. Anything omitted takes the project's or the default value. */
export interface ExportRequest {
  output: ExportOutput;
  startTime?: number;
  endTime?: number;
  fps?: number;
  encoder?: VideoEncoder;
  quality?: VideoQuality;
  includeAudio?: boolean;
  /** Offline only: replace an existing file at the output path. */
  overwrite?: boolean;
}

/** The facts a request is checked against. */
export interface ExportContext {
  /** The mode this machine supports, or null when it cannot export video at all. */
  mode: ExportMode | null;
  /** Project duration in seconds. */
  duration: number;
  projectFps: TimelineFps;
  /** An audio file is loaded. */
  hasAudio: boolean;
  /** Another export is running. */
  busy: boolean;
}

/** A request that passed every check, with every value resolved. */
export interface ExportPlan {
  mode: ExportMode;
  startTime: number;
  endTime: number;
  fps: TimelineFps;
  encoder: VideoEncoder;
  quality: VideoQuality;
  includeAudio: boolean;
  overwrite: boolean;
  output: ExportOutput;
}

export type ExportErrorCode =
  | 'busy'
  | 'unsupported'
  | 'duration'
  | 'range'
  | 'fps'
  | 'encoder'
  | 'audio'
  | 'output';

/** A request that cannot run. `code` says why, for callers that word it themselves. */
export class ExportError extends Error {
  readonly code: ExportErrorCode;

  constructor(code: ExportErrorCode, message: string) {
    super(message);
    this.name = 'ExportError';
    this.code = code;
  }
}

export const DEFAULT_EXPORT_ENCODER: VideoEncoder = 'x264';
export const DEFAULT_EXPORT_QUALITY: VideoQuality = 'medium';

/** Allowance for a range end computed from the duration in floating point. */
const EPSILON = 1e-6;

function isAbsolutePath(value: string) {
  // Windows drive (C:\ or C:/), UNC (\\server), or POSIX (/) paths.
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.startsWith('/');
}

/**
 * Check a request once, whoever made it (the save dialog or MCP), and
 * resolve its defaults. Throws an ExportError for a request that cannot run.
 *
 * The range must lie inside the project: 0 ≤ start < end ≤ duration. The end
 * defaults to the project end.
 */
export function planExport(request: ExportRequest, context: ExportContext): ExportPlan {
  if (context.busy) {
    throw new ExportError('busy', 'Another export is running.');
  }

  const { mode } = context;

  if (!mode) {
    throw new ExportError('unsupported', 'Video export is not supported here.');
  }

  const { duration } = context;

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new ExportError('duration', 'The project has no duration to export.');
  }

  const startTime = request.startTime ?? 0;
  const endTime = request.endTime ?? duration;

  if (
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    startTime < 0 ||
    endTime > duration + EPSILON
  ) {
    throw new ExportError(
      'range',
      `Export range must be within the project duration (${duration}s).`,
    );
  }

  if (endTime <= startTime) {
    throw new ExportError('range', 'The export must end after it starts.');
  }

  const fps = request.fps ?? context.projectFps;

  if (!isValidFps(fps)) {
    throw new ExportError('fps', `Unsupported frame rate: ${fps}.`);
  }

  const encoder = request.encoder ?? DEFAULT_EXPORT_ENCODER;
  const quality = request.quality ?? DEFAULT_EXPORT_QUALITY;

  if (!VIDEO_ENCODERS.includes(encoder) || !VIDEO_QUALITIES.includes(quality)) {
    throw new ExportError('encoder', `Unsupported encoder or quality: ${encoder}, ${quality}.`);
  }

  const includeAudio = request.includeAudio ?? true;

  if (includeAudio && !context.hasAudio) {
    throw new ExportError(
      'audio',
      'Load an audio file before exporting with audio, or set includeAudio=false.',
    );
  }

  const { output } = request;

  if (mode === 'offline' && !(output.path && isAbsolutePath(output.path))) {
    throw new ExportError('output', 'An offline export needs an absolute output path.');
  }

  return {
    mode,
    startTime,
    endTime: Math.min(endTime, duration),
    fps,
    encoder,
    quality,
    includeAudio,
    overwrite: request.overwrite ?? true,
    output,
  };
}
