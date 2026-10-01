import audioStore, { loadAudioFile } from '@/app/actions/audio';
import { raiseError } from '@/app/actions/error';
import { showModal } from '@/app/actions/modals';
import { api, audioContext, logger, player, renderBackend, renderer } from '@/app/global';
import { t } from '@/i18n/config';
import { platform } from '@/lib/platform';
import transportStore, {
  getProjectDuration,
  getProjectFps,
  getTransportState,
  pauseTransport,
  playTransport,
  seekTransport,
  setTransportLoop,
} from '@/lib/timeline/transport';
import { getVideoEncoderConfig, VIDEO_ENCODERS, type VideoEncoder } from '@/lib/video/encoders';
import {
  type ExportEncoder,
  type ExportProgress,
  isExportCancelledError,
} from '@/lib/video/exportEncoder';
import {
  DEFAULT_EXPORT_ENCODER,
  DEFAULT_EXPORT_QUALITY,
  ExportError,
  type ExportErrorCode,
  type ExportFileHandle,
  type ExportMode,
  type ExportPlan,
  type ExportRequest,
  planExport,
} from '@/lib/video/exportPlan';
import { createOfflineEncoder } from '@/lib/video/offlineEncoder';
import {
  type CaptureStreamCanvas,
  createRealtimeEncoder,
  recordingExtension,
  supportedRecordingMimeType,
} from '@/lib/video/realtimeEncoder';
import appStore from './app';

/**
 * Video export: one job at a time, whoever starts it (the save dialog or
 * MCP). A request is checked once (`planExport`), then the encoder the
 * machine supports produces the file: offline through ffmpeg, or realtime
 * with MediaRecorder. The job keeps the app's export state (status text,
 * progress marker, `isVideoRecording`) and its own progress for MCP.
 */

export type ExportJobState = 'running' | 'cancelling' | 'completed' | 'cancelled' | 'failed';

export interface ExportJob {
  readonly id: string;
  readonly plan: ExportPlan;
  readonly state: ExportJobState;
  readonly progress: ExportProgress;
  /** Where the video was saved, once it has been. */
  readonly savedPath?: string;
  readonly error?: string;
  /** Settles when the job ends: the saved path, or the error (an ExportCancelledError when cancelled offline). */
  readonly result: Promise<string>;
  /** End the export early; see ExportEncoder.cancel. */
  cancel(): void;
}

export const VIDEO_EXPORT_FPS_OPTIONS = [30, 60] as const;
export type VideoExportFps = (typeof VIDEO_EXPORT_FPS_OPTIONS)[number];
export type { VideoEncoder, VideoQuality } from '@/lib/video/encoders';
export { VIDEO_ENCODERS, VIDEO_QUALITIES } from '@/lib/video/encoders';
export type { ExportFileHandle } from '@/lib/video/exportPlan';

let activeJob: ExportJob | null = null;

/** How this machine exports video, or null when it cannot. */
export function getExportMode(): ExportMode | null {
  if (platform.encoder) {
    return 'offline';
  }

  return supportedRecordingMimeType() ? 'realtime' : null;
}

/** The file extension an export with `encoder` produces here. */
export function getExportExtension(encoder: VideoEncoder = DEFAULT_EXPORT_ENCODER) {
  if (getExportMode() === 'offline') {
    return getVideoEncoderConfig(encoder).video.extension;
  }

  const mimeType = supportedRecordingMimeType();

  return mimeType ? recordingExtension(mimeType) : 'webm';
}

/** Encoders the user can pick from: only offline (ffmpeg) exports offer a choice. */
export function getVideoEncoderOptions(): VideoEncoder[] {
  return getExportMode() === 'offline' ? [...VIDEO_ENCODERS] : [];
}

/** The running export, if any. */
export function getActiveExport(): ExportJob | null {
  return activeJob;
}

function createEncoder(mode: ExportMode): ExportEncoder {
  if (mode === 'offline') {
    const { encoder: ffmpeg, files } = platform;

    if (!ffmpeg || !files) {
      throw new ExportError('unsupported', 'ffmpeg is not available. Run pnpm install-ffmpeg.');
    }

    return createOfflineEncoder({
      ffmpeg,
      files,
      getAudioFile: () => audioStore.getState().source ?? null,
      stageSize: () => renderBackend.getSize(),
      render: (fps, work) => renderer.offline(fps, work),
      yieldToUI: () => new Promise(resolve => window.setTimeout(resolve, 0)),
    });
  }

  const canvas = renderBackend.getCanvas?.() as CaptureStreamCanvas | null;
  const mimeType = supportedRecordingMimeType();

  if (!canvas || typeof canvas.captureStream !== 'function' || !mimeType) {
    throw new ExportError('unsupported', 'The stage canvas cannot be recorded.');
  }

  return createRealtimeEncoder({
    canvas,
    mimeType,
    audioContext,
    audioNode: player.volume,
    transport: {
      seek: seekTransport,
      play: playTransport,
      pause: pauseTransport,
      setLoop: setTransportLoop,
      getState: getTransportState,
      subscribe: listener => transportStore.subscribe(listener),
    },
    save: (output, blob, fileName) =>
      api.saveVideoFile(output.handle ?? output.path ?? fileName, blob, {
        mimeType,
        fileName,
      }),
  });
}

function showProgress(plan: ExportPlan, progress: ExportProgress) {
  const duration = getProjectDuration();

  switch (progress.status) {
    case 'preparing':
      appStore.setState({ statusText: t('status.export-preparing') });
      break;
    case 'rendering-video': {
      const { currentFrame = 0, totalFrames = 0 } = progress;
      const time =
        plan.startTime +
        (totalFrames > 0 ? currentFrame / totalFrames : 0) * (plan.endTime - plan.startTime);

      appStore.setState({
        statusText: t('status.export-rendering-video', {
          current: currentFrame,
          total: totalFrames,
        }),
        videoExportPosition: duration > 0 ? time / duration : 0,
      });
      break;
    }
    case 'rendering-audio':
      appStore.setState({ statusText: t('status.export-rendering-audio') });
      break;
    case 'merging':
      appStore.setState({ statusText: t('status.export-merging') });
      break;
    case 'recording':
      // The playhead shows where a realtime export is.
      appStore.setState({ statusText: '' });
      break;
    case 'finished':
      appStore.setState({ statusText: t('status.export-finished') });
      break;
  }
}

/**
 * Check a request and start exporting. Throws an ExportError, before anything
 * starts, when the request cannot run; otherwise returns the running job.
 */
export function startExport(request: ExportRequest): ExportJob {
  const mode = getExportMode();
  const plan = planExport(request, {
    mode,
    duration: getProjectDuration(),
    projectFps: getProjectFps(),
    // Offline exports read the audio file; realtime ones record what the player plays.
    hasAudio: mode === 'offline' ? Boolean(audioStore.getState().source) : player.hasAudio(),
    busy: activeJob !== null,
  });
  const encoder = createEncoder(plan.mode);

  let state: ExportJobState = 'running';
  let progress: ExportProgress = { status: 'preparing' };
  let savedPath: string | undefined;
  let error: string | undefined;

  pauseTransport();
  appStore.setState({ isVideoRecording: true, statusText: t('status.export-preparing') });

  const result = encoder
    .run(plan, next => {
      // Frame counts change every frame; the other phases only when they begin.
      if (next.status === 'rendering-video' || next.status !== progress.status) {
        showProgress(plan, next);
      }
      progress = next;
    })
    .then(
      path => {
        state = 'completed';
        savedPath = path;
        logger.log('Video saved:', path);
        return path;
      },
      cause => {
        state = isExportCancelledError(cause) ? 'cancelled' : 'failed';
        error = cause instanceof Error ? cause.message : String(cause);
        throw cause;
      },
    )
    .finally(() => {
      activeJob = null;
      appStore.setState({
        isVideoRecording: false,
        videoExportSegment: null,
        videoExportPosition: null,
        statusText: '',
      });
    });

  const job: ExportJob = {
    id: crypto.randomUUID(),
    plan,
    get state() {
      return state;
    },
    get progress() {
      return progress;
    },
    get savedPath() {
      return savedPath;
    },
    get error() {
      return error;
    },
    result,
    cancel() {
      if (state !== 'running') return;

      if (plan.mode === 'offline') {
        state = 'cancelling';
        appStore.setState({ statusText: t('status.export-cancelling') });
      }

      encoder.cancel();
    },
  };

  // Callers that only hold the job still see failures through `result`.
  result.catch(() => {});
  activeJob = job;

  return job;
}

/** End the running export early. Returns false when none is running. */
export function cancelExport() {
  if (!activeJob) {
    return false;
  }

  activeJob.cancel();
  return true;
}

// ---- The save dialog ---------------------------------------------------------

const ERROR_KEYS: Record<ExportErrorCode, string> = {
  busy: 'errors.video-recording-in-progress',
  unsupported: 'errors.video-recording-unsupported',
  duration: 'errors.video-duration-failed',
  range: 'errors.video-end-before-start',
  fps: 'errors.start-video-recording-failed',
  encoder: 'errors.start-video-recording-failed',
  audio: 'errors.choose-audio-before-saving-video',
  output: 'errors.ffmpeg-output-path-required',
};

const TRANSIENT_STATUS_MS = 6000;

/** Show a status bar message briefly, then restore whatever was there before. */
function showTransientStatus(message: string) {
  const previous = appStore.getState().statusText;
  appStore.setState({ statusText: message });

  window.setTimeout(() => {
    if (appStore.getState().statusText === message) {
      appStore.setState({ statusText: previous });
    }
  }, TRANSIENT_STATUS_MS);
}

export interface VideoSaveLocation {
  canceled: boolean;
  defaultPath: string;
  extension: string;
  fileHandle?: ExportFileHandle | null;
  filePath?: string;
}

/** False when the browser will prompt for the location itself at the end of the export. */
export function canChooseVideoSaveLocation() {
  return api.canPickSaveLocation({ preferNativePath: getExportMode() === 'offline' });
}

export async function chooseVideoSaveLocation(
  preferredPath?: string,
  extension = 'webm',
): Promise<VideoSaveLocation> {
  const defaultPath = preferredPath || `video-${Date.now()}.${extension}`;
  // ffmpeg needs a real path; recordings use File System Access or a download.
  const { fileHandle, filePath, canceled } = await api.showSaveDialog({
    defaultPath,
    filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
    preferNativePath: getExportMode() === 'offline',
  });

  if (canceled) {
    return { canceled: true, defaultPath, extension };
  }

  return {
    canceled: false,
    fileHandle,
    filePath: filePath || fileHandle?.name || defaultPath,
    defaultPath,
    extension,
  };
}

/** Open the save dialog for the project. */
export function saveVideo() {
  if (!getExportMode()) {
    raiseError(t('errors.video-recording-unsupported'));
    return;
  }

  if (activeJob) {
    raiseError(t('errors.video-recording-in-progress'));
    return;
  }

  const audio = audioStore.getState();
  const totalDuration = getProjectDuration();

  // Stop playback while the dialog is open.
  pauseTransport();

  showModal(
    'SaveVideoDialog',
    { titleKey: 'save-video.save-video', showCloseButton: false },
    {
      fileHandle: null,
      filePath: '',
      defaultPath: `video-${Date.now()}.${getExportExtension()}`,
      extension: getExportExtension(),
      audioSource: audio.source ?? null,
      audioFileName: audio.file ?? '',
      audioBuffer: player.getAudio()?.buffer ?? null,
      audioDuration: Number(audio.duration ?? 0),
      totalDuration,
      startTime: 0,
      endTime: totalDuration,
      includeAudio: true,
      fps: getProjectFps(),
      encoder: DEFAULT_EXPORT_ENCODER,
      encoderOptions: getVideoEncoderOptions(),
      quality: DEFAULT_EXPORT_QUALITY,
    },
  );
}

/**
 * Export from the save dialog: load the audio the user picked, run the job,
 * and report the outcome in the status bar. Resolves true when the video was
 * saved.
 */
export async function exportVideo({
  audioSource,
  ...request
}: ExportRequest & { audioSource?: File | null }): Promise<boolean> {
  // Exporting with audio that failed to load would export the wrong audio.
  if (
    audioSource &&
    audioSource !== audioStore.getState().source &&
    !(await loadAudioFile(audioSource, false))
  ) {
    return false;
  }

  let job: ExportJob;

  try {
    job = startExport(request);
  } catch (error) {
    raiseError(
      t(
        error instanceof ExportError
          ? ERROR_KEYS[error.code]
          : 'errors.start-video-recording-failed',
      ),
      error,
    );
    return false;
  }

  try {
    const savedPath = await job.result;

    if (job.plan.mode === 'offline') {
      await platform.files?.reveal(savedPath).catch(() => {});
    } else {
      showTransientStatus(t('status.video-saved', { name: savedPath.split(/[\\/]/).pop() }));
    }

    return true;
  } catch (error) {
    if (isExportCancelledError(error)) {
      showTransientStatus(t('status.export-cancelled'));
      return false;
    }

    raiseError(
      t(job.plan.mode === 'offline' ? 'errors.ffmpeg-export-failed' : 'errors.record-video-failed'),
      error,
    );
    return false;
  }
}

// ---- The range marker shown while choosing and exporting ---------------------

export function setVideoExportSegment(startTime: number, endTime: number, totalDuration: number) {
  if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
    appStore.setState({ videoExportSegment: null });
    return;
  }

  const startPosition = Math.max(0, Math.min(1, startTime / totalDuration));
  const endPosition = Math.max(0, Math.min(1, endTime / totalDuration));
  const isFullDuration = startPosition <= 0 && endPosition >= 1;

  if (endPosition <= startPosition || isFullDuration) {
    appStore.setState({ videoExportSegment: null });
    return;
  }

  appStore.setState({ videoExportSegment: { startPosition, endPosition } });
}

export function clearVideoExportSegment() {
  appStore.setState({ videoExportSegment: null });
}
