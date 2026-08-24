import { create } from 'zustand';
import audioStore, {
  connectMicrophone,
  connectMidiInput,
  loadAudioFile,
  openAudioFile,
} from '@/app/actions/audio';
import { raiseError } from '@/app/actions/error';
import { showModal } from '@/app/actions/modals';
import {
  checkUnsavedChanges,
  newProject,
  openProjectFile,
  saveProject,
} from '@/app/actions/project';
import {
  checkForDesktopUpdates,
  downloadDesktopUpdate,
  getDesktopBridge,
  isDesktopUpdaterAvailable,
  isFfmpegAvailable,
  onDesktopUpdaterStatus,
} from '@/app/desktop';
import { api, audioContext, library, logger, player, renderBackend, renderer } from '@/app/global';
import { getAutomaticUpdates } from '@/app/preferences';
import { t } from '@/i18n/config';
import { registerGeneratedNameLabels } from '@/i18n/labels';
import * as displays from '@/lib/displays';
import * as effects from '@/lib/effects';
import { loadInstalledPlugins } from '@/lib/plugins';
import { finalizeWebm } from '@/lib/utils/webm';
import {
  getVideoEncoderConfig,
  VIDEO_ENCODERS,
  type VideoEncoder,
  type VideoQuality,
} from '@/lib/video/encoders';
import VideoExporter, { isVideoExportCancelledError } from '@/lib/video/VideoExporter';

export interface VideoExportSegment {
  startPosition: number;
  endPosition: number;
}

export type AddMenuKind = 'effects' | 'displays';

export interface AddMenuState {
  sceneId: string;
  kind: AddMenuKind;
}

interface AppState {
  statusText: string;
  showReactor: boolean;
  activeReactorId: string | null;
  activeElementId: string | null;
  cameraModeEnabled: boolean;
  displayTransformModeEnabled: boolean;
  isLeftPanelVisible: boolean;
  isBottomPanelVisible: boolean;
  isRightPanelVisible: boolean;
  controlsPanelMode: 'active' | 'all';
  isVideoRecording: boolean;
  isStagePictureInPictureActive: boolean;
  videoExportSegment: VideoExportSegment | null;
  /** Export playhead position (0-1 of total duration) while an offline export is running. */
  videoExportPosition: number | null;
  pluginsUpdatedAt: number;
  /** Slide-out "add element" menu (effects / 2D / 3D displays) for a scene. */
  addMenu: AddMenuState | null;
}

export interface FileHandleLike {
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (blob: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
}

interface VideoSaveLocationResult {
  canceled: boolean;
  defaultPath: string;
  extension: string;
  fileHandle?: FileHandleLike | null;
  filePath?: string;
}

interface StartVideoRecordingOptions {
  fileHandle?: FileHandleLike | null;
  filePath?: string;
  defaultPath?: string;
  startTime?: number;
  endTime?: number;
  includeAudio?: boolean;
  audioSource?: File | null;
  fps?: VideoExportFps;
  encoder?: VideoEncoder;
  quality?: VideoQuality;
}

export const VIDEO_EXPORT_FPS_OPTIONS = [30, 60] as const;
export type VideoExportFps = (typeof VIDEO_EXPORT_FPS_OPTIONS)[number];

export type { VideoEncoder, VideoQuality } from '@/lib/video/encoders';
export { VIDEO_ENCODERS, VIDEO_QUALITIES } from '@/lib/video/encoders';

const DEFAULT_EXPORT_ENCODER: VideoEncoder = 'x264';
const DEFAULT_EXPORT_QUALITY: VideoQuality = 'medium';

/** MediaRecorder bitrate per quality level (browser exports). */
const MEDIA_RECORDER_BITS_PER_SECOND: Record<VideoQuality, number> = {
  low: 4_000_000,
  medium: 8_000_000,
  high: 16_000_000,
};

interface CaptureStreamCanvas {
  captureStream: (frameRate?: number) => MediaStream;
}

interface PluginConfig {
  name: string;
  label: string;
  type: string;
  defaultProperties: Record<string, unknown>;
  icon?: string;
  builtin?: boolean;
}

type LibraryPlugin = {
  config: PluginConfig;
};

type LibraryConstructor = (new (properties?: Record<string, unknown>) => unknown) & LibraryPlugin;

const initialState: AppState = {
  statusText: '',
  showReactor: false,
  activeReactorId: null,
  activeElementId: null,
  cameraModeEnabled: false,
  displayTransformModeEnabled: false,
  isLeftPanelVisible: true,
  isBottomPanelVisible: true,
  isRightPanelVisible: true,
  controlsPanelMode: 'all',
  isVideoRecording: false,
  isStagePictureInPictureActive: false,
  videoExportSegment: null,
  videoExportPosition: null,
  pluginsUpdatedAt: 0,
  addMenu: null,
};

const appStore = create<AppState>(() => ({
  ...initialState,
}));

let appInitPromise: Promise<void> | null = null;
let appInitialized = false;
let activeVideoRecorder: MediaRecorder | null = null;
let activeFfmpegExport: VideoExporter | null = null;
let stagePictureInPictureVideo: HTMLVideoElement | null = null;
let stagePictureInPictureStream: MediaStream | null = null;

const DEFAULT_VIDEO_FPS = 60;
const DEFAULT_EXPORT_FPS: VideoExportFps = 30;
const RECORDING_TIMESLICE_MS = 250;
const VIDEO_MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
];

function getSupportedVideoMimeType(): string | null {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return null;
  }

  return (
    VIDEO_MIME_CANDIDATES.find(mimeType => window.MediaRecorder.isTypeSupported(mimeType)) || null
  );
}

/**
 * Encoders the user can pick from. Only desktop builds with ffmpeg expose a
 * choice; browser exports always use MediaRecorder.
 */
export function getVideoEncoderOptions(): VideoEncoder[] {
  return isFfmpegAvailable() ? [...VIDEO_ENCODERS] : [];
}

function getExtensionFromMimeType(mimeType: string): string {
  return mimeType.includes('mp4') ? 'mp4' : 'webm';
}

function cleanupStagePictureInPictureStream() {
  for (const track of stagePictureInPictureStream?.getTracks() || []) {
    track.stop();
  }

  stagePictureInPictureStream = null;

  if (stagePictureInPictureVideo) {
    stagePictureInPictureVideo.srcObject = null;
  }
}

function handleStagePictureInPictureLeave() {
  cleanupStagePictureInPictureStream();
  appStore.setState({ isStagePictureInPictureActive: false });
}

function ensureStagePictureInPictureVideo(): HTMLVideoElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (stagePictureInPictureVideo) {
    return stagePictureInPictureVideo;
  }

  const video = document.createElement('video');
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.style.position = 'fixed';
  video.style.top = '-9999px';
  video.style.left = '-9999px';
  video.style.width = '1px';
  video.style.height = '1px';
  video.style.opacity = '0';
  video.style.pointerEvents = 'none';
  video.addEventListener('leavepictureinpicture', handleStagePictureInPictureLeave);
  document.body.appendChild(video);
  stagePictureInPictureVideo = video;

  return stagePictureInPictureVideo;
}

export function isStagePictureInPictureSupported() {
  if (typeof document === 'undefined') {
    return false;
  }

  const video = document.createElement('video');

  return Boolean(
    document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function',
  );
}

function isVideoExportInProgress() {
  return Boolean(
    activeFfmpegExport || (activeVideoRecorder && activeVideoRecorder.state === 'recording'),
  );
}

function getVideoRecordingSetup(encoder: VideoEncoder = DEFAULT_EXPORT_ENCODER): {
  mode: 'ffmpeg' | 'mediarecorder';
  canvas: CaptureStreamCanvas | null;
  mimeType: string;
  extension: string;
} | null {
  if (isVideoExportInProgress()) {
    raiseError(t('errors.video-recording-in-progress'));
    return null;
  }

  if (isFfmpegAvailable()) {
    const { extension } = getVideoEncoderConfig(encoder).video;
    return {
      mode: 'ffmpeg',
      canvas: null,
      mimeType: `video/${extension}`,
      extension,
    };
  }

  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    raiseError(t('errors.video-recording-unsupported'));
    return null;
  }

  const canvas = renderBackend.getCanvas?.() as CaptureStreamCanvas | null;

  if (!canvas || typeof canvas.captureStream !== 'function') {
    raiseError(t('errors.stage-canvas-video-access-failed'));
    return null;
  }

  const mimeType = getSupportedVideoMimeType();

  if (!mimeType) {
    raiseError(t('errors.no-supported-video-format'));
    return null;
  }

  return {
    mode: 'mediarecorder',
    canvas,
    mimeType,
    extension: getExtensionFromMimeType(mimeType),
  };
}

function getNativeFilePath(file: File | null | undefined): string | null {
  if (!file) return null;
  const withPath = file as File & { path?: string; filePath?: string };
  return withPath.path || withPath.filePath || null;
}

async function resolveAudioPathForFfmpeg(
  audioSource: File | null,
): Promise<{ path: string | null; cleanupPaths: string[] }> {
  if (!audioSource) {
    return { path: null, cleanupPaths: [] };
  }

  const existingPath = getNativeFilePath(audioSource);
  if (existingPath) {
    return { path: existingPath, cleanupPaths: [] };
  }

  const bridge = getDesktopBridge();
  if (!bridge?.writeTempFile) {
    throw new Error(t('errors.ffmpeg-temp-audio-failed'));
  }

  const buffer = await audioSource.arrayBuffer();
  const extensionMatch = audioSource.name?.match(/\.([a-z0-9]+)$/i);
  const ext = extensionMatch?.[1] || 'bin';
  const { filePath } = await bridge.writeTempFile(`export-audio-${Date.now()}.${ext}`, buffer);
  return { path: filePath, cleanupPaths: [filePath] };
}

/** False when the browser will prompt for the location itself at the end of the export. */
export function canChooseVideoSaveLocation() {
  return api.canPickSaveLocation({ preferNativePath: isFfmpegAvailable() });
}

export async function chooseVideoSaveLocation(
  preferredPath?: string,
  extension = 'webm',
): Promise<VideoSaveLocationResult> {
  const defaultPath = preferredPath || `video-${Date.now()}.${extension}`;
  const filters = [{ name: extension.toUpperCase(), extensions: [extension] }];
  // FFmpeg needs a real filesystem path; MediaRecorder uses File System Access / download.
  const { fileHandle, filePath, canceled } = await api.showSaveDialog({
    defaultPath,
    filters,
    preferNativePath: isFfmpegAvailable(),
  });

  if (canceled) {
    return {
      canceled: true,
      defaultPath,
      extension,
    };
  }

  return {
    canceled: false,
    fileHandle,
    filePath: filePath || fileHandle?.name || defaultPath,
    defaultPath,
    extension,
  };
}

export async function saveImage() {
  // Same web File System Access path as the browser build (no native dialog).
  const { fileHandle, filePath, canceled } = await api.showSaveDialog({
    defaultPath: `image-${Date.now()}.png`,
    filters: [
      { name: 'PNG', extensions: ['png'] },
      { name: 'JPEG', extensions: ['jpg'] },
    ],
  });

  if (!canceled) {
    try {
      const data = renderer.getFrameData(0);

      renderBackend.render(data);

      const fileName = fileHandle?.name || filePath || `image-${Date.now()}.png`;
      const isJpeg = /jpe?g$/i.test(fileName);
      const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
      const buffer = renderBackend.getImage(mimeType);

      await api.saveImageFile(fileHandle || filePath || fileName, buffer, {
        mimeType,
        fileName,
      });

      logger.log('Image saved:', fileName);
    } catch (error) {
      raiseError(t('errors.save-image-failed'), error);
    }
  }
}

export async function saveVideo() {
  const setup = getVideoRecordingSetup(DEFAULT_EXPORT_ENCODER);

  if (!setup) {
    return;
  }

  const audioState = audioStore.getState() as {
    file?: string;
    source?: File | null;
    duration?: number;
  };
  const audioBuffer =
    (player.getAudio?.() as { buffer?: AudioBuffer | null } | undefined)?.buffer ?? null;
  const totalDuration = Number(audioState.duration ?? 0);

  // Stop playback while the export dialog is open.
  if (player.isPlaying()) {
    player.pause();
  }

  showModal(
    'SaveVideoDialog',
    { titleKey: 'save-video.save-video', showCloseButton: false },
    {
      fileHandle: null,
      filePath: '',
      defaultPath: `video-${Date.now()}.${setup.extension}`,
      extension: setup.extension,
      audioSource: audioState.source ?? null,
      audioFileName: audioState.file ?? '',
      audioBuffer,
      totalDuration,
      startTime: 0,
      endTime: totalDuration,
      includeAudio: true,
      fps: DEFAULT_EXPORT_FPS,
      encoder: DEFAULT_EXPORT_ENCODER,
      encoderOptions: getVideoEncoderOptions(),
      quality: DEFAULT_EXPORT_QUALITY,
    },
  );
}

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

  appStore.setState({
    videoExportSegment: {
      startPosition,
      endPosition,
    },
  });
}

export function clearVideoExportSegment() {
  appStore.setState({ videoExportSegment: null });
}

/** True while an offline (ffmpeg) export is running and can be cancelled. */
export function isFfmpegExportActive() {
  return activeFfmpegExport !== null;
}

/**
 * Cancel the in-progress video export/recording. For the offline ffmpeg
 * pipeline this kills the encoder and discards temp files; for the
 * MediaRecorder path stopping playback ends the recording early.
 */
export function cancelVideoExport() {
  if (activeFfmpegExport) {
    activeFfmpegExport.cancel();
    appStore.setState({ statusText: t('status.export-cancelling') });
    return true;
  }
  if (activeVideoRecorder && activeVideoRecorder.state === 'recording') {
    player.stop();
    return true;
  }
  return false;
}

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

function isAbsoluteOutputPath(value: string) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.startsWith('/');
}

async function startFfmpegVideoExport({
  filePath,
  defaultPath,
  startTime = 0,
  endTime,
  includeAudio = true,
  audioSource = null,
  fps = DEFAULT_EXPORT_FPS,
  encoder = DEFAULT_EXPORT_ENCODER,
  quality = DEFAULT_EXPORT_QUALITY,
}: StartVideoRecordingOptions): Promise<boolean> {
  const bridge = getDesktopBridge();
  const outputPath = filePath || defaultPath || '';

  // preferNativePath save dialog must yield an absolute filesystem path for ffmpeg.
  if (!outputPath || !isAbsoluteOutputPath(outputPath)) {
    raiseError(t('errors.ffmpeg-output-path-required'));
    return false;
  }

  const totalDuration = player.getDuration();
  const clampedStartTime = Math.max(0, startTime);
  const clampedEndTime = Math.min(totalDuration, endTime ?? totalDuration);

  if (clampedEndTime <= clampedStartTime) {
    raiseError(t('errors.video-end-before-start'));
    return false;
  }

  let audioResolved: { path: string | null; cleanupPaths: string[] } = {
    path: null,
    cleanupPaths: [],
  };

  try {
    audioResolved = includeAudio
      ? await resolveAudioPathForFfmpeg(audioSource)
      : { path: null, cleanupPaths: [] };

    if (includeAudio && !audioResolved.path) {
      raiseError(t('errors.choose-audio-before-saving-video'));
      return false;
    }
  } catch (error) {
    raiseError(t('errors.ffmpeg-temp-audio-failed'), error);
    return false;
  }

  const exporter = new VideoExporter();
  activeFfmpegExport = exporter;
  appStore.setState({
    isVideoRecording: true,
    statusText: t('status.export-preparing'),
  });

  try {
    const savedPath = await exporter.export({
      outputPath,
      audioFilePath: audioResolved.path,
      includeAudio: includeAudio && Boolean(audioResolved.path),
      startTime: clampedStartTime,
      endTime: clampedEndTime,
      fps,
      encoder,
      quality,
      onProgress: ({ status, currentFrame, totalFrames }) => {
        if (status === 'rendering-video' && totalFrames) {
          const exportTime =
            clampedStartTime +
            ((currentFrame ?? 0) / totalFrames) * (clampedEndTime - clampedStartTime);
          appStore.setState({
            statusText: t('status.export-rendering-video', {
              current: currentFrame ?? 0,
              total: totalFrames,
            }),
            videoExportPosition: totalDuration > 0 ? exportTime / totalDuration : 0,
          });
          return;
        }
        if (status === 'rendering-audio') {
          appStore.setState({ statusText: t('status.export-rendering-audio') });
          return;
        }
        if (status === 'merging') {
          appStore.setState({ statusText: t('status.export-merging') });
          return;
        }
        if (status === 'finished') {
          appStore.setState({ statusText: t('status.export-finished') });
        }
      },
    });

    logger.log('FFmpeg video saved:', savedPath);
    if (bridge?.showItemInFolder) {
      try {
        await bridge.showItemInFolder(savedPath);
      } catch {
        // non-fatal
      }
    }
    return true;
  } catch (error) {
    if (exporter.isCancelled || isVideoExportCancelledError(error)) {
      // User-initiated cancel: not an error, just say so briefly.
      logger.log('FFmpeg video export cancelled');
      appStore.setState({ statusText: '' });
      showTransientStatus(t('status.export-cancelled'));
      return false;
    }
    raiseError(t('errors.ffmpeg-export-failed'), error);
    return false;
  } finally {
    activeFfmpegExport = null;
    appStore.setState({
      isVideoRecording: false,
      videoExportSegment: null,
      videoExportPosition: null,
      ...(exporter.isCancelled ? {} : { statusText: '' }),
    });

    if (bridge?.removePath) {
      for (const tempPath of audioResolved.cleanupPaths) {
        try {
          await bridge.removePath(tempPath);
        } catch {
          // best-effort
        }
      }
    }
  }
}

export async function startVideoRecording({
  fileHandle,
  filePath,
  defaultPath,
  startTime = 0,
  endTime,
  includeAudio = true,
  audioSource = null,
  fps = DEFAULT_EXPORT_FPS,
  encoder = DEFAULT_EXPORT_ENCODER,
  quality = DEFAULT_EXPORT_QUALITY,
}: StartVideoRecordingOptions): Promise<boolean> {
  if (audioSource) {
    await loadAudioFile(audioSource, false);
  }

  const setup = getVideoRecordingSetup(encoder);

  if (!setup) {
    return false;
  }

  if (!player.hasAudio()) {
    raiseError(t('errors.choose-audio-before-saving-video'));
    return false;
  }

  const totalDuration = player.getDuration();

  if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
    raiseError(t('errors.video-duration-failed'));
    return false;
  }

  const clampedStartTime = Math.max(0, startTime);
  const clampedEndTime = Math.min(totalDuration, endTime ?? totalDuration);

  if (clampedEndTime <= clampedStartTime) {
    raiseError(t('errors.video-end-before-start'));
    return false;
  }

  if (setup.mode === 'ffmpeg') {
    return startFfmpegVideoExport({
      filePath,
      defaultPath,
      startTime: clampedStartTime,
      endTime: clampedEndTime,
      includeAudio,
      audioSource,
      fps,
      encoder,
      quality,
    });
  }

  if (!setup.canvas) {
    raiseError(t('errors.stage-canvas-video-access-failed'));
    return false;
  }

  const durationMs = Math.max(250, Math.round((clampedEndTime - clampedStartTime) * 1000));
  const targetPath =
    filePath || fileHandle?.name || defaultPath || `video-${Date.now()}.${setup.extension}`;
  const previousLoop = player.isLooping();
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  let recordingStream: MediaStream | null = null;

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const canvasStream = setup.canvas.captureStream(fps || DEFAULT_VIDEO_FPS);
    const tracks = [...canvasStream.getVideoTracks()];

    if (includeAudio) {
      audioDestination = audioContext.createMediaStreamDestination();
      player.volume.connect(audioDestination);
      tracks.push(...audioDestination.stream.getAudioTracks());
    }

    recordingStream = new MediaStream(tracks);
    const recorder = new window.MediaRecorder(recordingStream, {
      mimeType: setup.mimeType,
      videoBitsPerSecond: MEDIA_RECORDER_BITS_PER_SECOND[quality],
    });

    activeVideoRecorder = recorder;
    const chunks: Blob[] = [];
    const fileName = targetPath;
    let stopTimer: number | null = null;
    let recordingFailed = false;
    let recordingStartedAt = 0;

    const onPlayerStop = () => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    };

    const cleanup = () => {
      if (stopTimer) {
        window.clearTimeout(stopTimer);
        stopTimer = null;
      }

      player.off('stop', onPlayerStop);
      player.setLoop(previousLoop);

      if (audioDestination) {
        try {
          player.volume.disconnect(audioDestination);
        } catch (_error) {
          // Ignore disconnect errors from stale nodes.
        }
      }

      for (const track of recordingStream?.getTracks() || []) {
        track.stop();
      }

      if (player.isPlaying()) {
        player.stop();
      }

      activeVideoRecorder = null;
      appStore.setState({
        isVideoRecording: false,
        videoExportSegment: null,
      });
    };

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = (event: Event & { error?: DOMException }) => {
      recordingFailed = true;
      cleanup();
      raiseError(t('errors.record-video-failed'), event?.error || event);
    };

    recorder.onstart = () => {
      recordingStartedAt = performance.now();
    };

    recorder.onstop = async () => {
      if (recordingFailed) {
        cleanup();
        return;
      }

      try {
        const elapsedMs = recordingStartedAt ? performance.now() - recordingStartedAt : durationMs;
        // MediaRecorder leaves WebM files "unfinished" (no duration, unknown
        // segment/cluster sizes). Browsers tolerate that, but many desktop
        // players show black video with no audio until the container is fixed.
        const blob = await finalizeWebm(new Blob(chunks, { type: setup.mimeType }), elapsedMs);

        await api.saveVideoFile(fileHandle || targetPath || fileName, blob, {
          mimeType: setup.mimeType,
          fileName,
        });

        logger.log('Video saved:', fileName);
        showTransientStatus(t('status.video-saved', { name: fileName.split(/[\\/]/).pop() }));
      } catch (error) {
        raiseError(t('errors.save-video-file-failed'), error);
      } finally {
        cleanup();
      }
    };

    player.stop();
    player.setLoop(false);
    player.seek(clampedStartTime / totalDuration);
    player.on('stop', onPlayerStop);

    recorder.start(RECORDING_TIMESLICE_MS);
    appStore.setState({ isVideoRecording: true });
    player.play();

    stopTimer = window.setTimeout(() => {
      player.stop();
    }, durationMs);
    return true;
  } catch (error) {
    player.setLoop(previousLoop);

    if (audioDestination) {
      try {
        player.volume.disconnect(audioDestination);
      } catch (_error) {
        // Ignore disconnect errors from stale nodes.
      }
    }

    if (recordingStream) {
      for (const track of recordingStream.getTracks()) {
        track.stop();
      }
    }

    activeVideoRecorder = null;
    appStore.setState({ isVideoRecording: false });
    raiseError(t('errors.start-video-recording-failed'), error);
    return false;
  }
}

export async function startStagePictureInPicture() {
  if (!isStagePictureInPictureSupported()) {
    raiseError(t('errors.picture-in-picture-unsupported'));
    return false;
  }

  const canvas = renderBackend.getCanvas?.() as CaptureStreamCanvas | null;

  if (!canvas || typeof canvas.captureStream !== 'function') {
    raiseError(t('errors.stage-canvas-picture-in-picture-access-failed'));
    return false;
  }

  const video = ensureStagePictureInPictureVideo();

  if (!video) {
    raiseError(t('errors.picture-in-picture-init-failed'));
    return false;
  }

  try {
    renderer.requestRender();

    if (document.pictureInPictureElement && document.pictureInPictureElement !== video) {
      await document.exitPictureInPicture();
    }

    cleanupStagePictureInPictureStream();
    stagePictureInPictureStream = canvas.captureStream(DEFAULT_VIDEO_FPS);
    video.srcObject = stagePictureInPictureStream;
    await video.play();
    await video.requestPictureInPicture();
    appStore.setState({ isStagePictureInPictureActive: true });
    return true;
  } catch (error) {
    handleStagePictureInPictureLeave();
    raiseError(t('errors.start-picture-in-picture-failed'), error);
    return false;
  }
}

export async function stopStagePictureInPicture() {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    if (
      stagePictureInPictureVideo &&
      document.pictureInPictureElement === stagePictureInPictureVideo
    ) {
      await document.exitPictureInPicture();
    } else {
      handleStagePictureInPictureLeave();
    }

    return true;
  } catch (error) {
    raiseError(t('errors.close-picture-in-picture-failed'), error);
    return false;
  }
}

export function toggleStagePictureInPicture() {
  if (appStore.getState().isStagePictureInPictureActive) {
    return stopStagePictureInPicture();
  }

  return startStagePictureInPicture();
}

export function setActiveReactorId(reactorId?: string | null) {
  appStore.setState({ activeReactorId: reactorId || null });
}

export function setControlsPanelMode(mode: 'active' | 'all') {
  appStore.setState({ controlsPanelMode: mode });
}

export function setActiveElementId(elementId?: string | null) {
  appStore.setState({ activeElementId: elementId || null });
}

export function setCameraModeEnabled(enabled: boolean) {
  appStore.setState({ cameraModeEnabled: enabled });
  renderer.setContinuousRendering('camera-mode', enabled);
  renderer.requestRender();
}

export function setDisplayTransformModeEnabled(enabled: boolean) {
  appStore.setState({ displayTransformModeEnabled: enabled });
  renderer.setContinuousRendering('display-transform', enabled);
  renderer.requestRender();
}

export function toggleCameraMode() {
  setCameraModeEnabled(!appStore.getState().cameraModeEnabled);
}

export function openAddMenu(sceneId: string, kind: AddMenuKind) {
  appStore.setState({ addMenu: { sceneId, kind } });
}

export function closeAddMenu() {
  if (appStore.getState().addMenu) {
    appStore.setState({ addMenu: null });
  }
}

export function toggleLeftPanelVisibility() {
  appStore.setState(state => ({
    isLeftPanelVisible: !state.isLeftPanelVisible,
  }));
}

export function toggleBottomPanelVisibility() {
  appStore.setState(state => ({
    isBottomPanelVisible: !state.isBottomPanelVisible,
  }));
}

export function toggleRightPanelVisibility() {
  appStore.setState(state => ({
    isRightPanelVisible: !state.isRightPanelVisible,
  }));
}

export async function handleMenuAction(action: string) {
  switch (action) {
    case 'new-project':
      await checkUnsavedChanges(action, newProject);
      break;

    case 'open-project':
      await checkUnsavedChanges(action, openProjectFile);
      break;

    case 'save-project':
      await saveProject(undefined);
      break;

    case 'load-audio':
      await openAudioFile(undefined);
      break;

    case 'use-microphone':
      await connectMicrophone(undefined);
      break;

    case 'use-midi':
      await connectMidiInput(undefined);
      break;

    case 'save-image':
      await saveImage();
      break;

    case 'save-video':
      await saveVideo();
      break;

    case 'edit-canvas':
      await showModal('CanvasSettings', {
        titleKey: 'menu.project-settings',
        showCloseButton: false,
      });
      break;

    case 'manage-plugins':
      await showModal('ManagePlugins', {
        titleKey: 'menu.manage-plugins',
      });
      break;

    case 'open-dev-tools':
      api.openDevTools();
      break;
  }
}

export async function loadPlugins() {
  let plugins: Record<string, LibraryConstructor> = {};

  try {
    plugins = (await loadInstalledPlugins()) as unknown as Record<string, LibraryConstructor>;
  } catch (e) {
    logger.error(e);
  }

  library.set('plugins', plugins);
}

// Rebuilds the library after a plugin install/uninstall and nudges any UI
// that lists library entries (e.g. the Add menus) to re-render.
export async function reloadPluginLibrary() {
  await loadPlugins();
  await loadLibrary();

  appStore.setState({ pluginsUpdatedAt: Date.now() });
}

export async function loadLibrary() {
  const plugins = (library.get('plugins') ?? {}) as Record<string, LibraryConstructor>;

  // Core displays/effects ship with the app and can't be removed; they are
  // flagged builtin so UI can tell them apart from installed plugins.
  const coreDisplays: Record<string, LibraryConstructor> = {};
  for (const [key, display] of Object.entries(displays as Record<string, LibraryConstructor>)) {
    display.config.icon = `images/controls/${key}.png`;
    display.config.builtin = true;

    coreDisplays[key] = display;
  }

  const coreEffects: Record<string, LibraryConstructor> = {};
  for (const [key, effect] of Object.entries(effects as Record<string, LibraryConstructor>)) {
    effect.config.icon = `images/controls/${key}.png`;
    effect.config.builtin = true;

    coreEffects[key] = effect;
  }

  for (const [key, plugin] of Object.entries(plugins)) {
    const { type } = plugin.config;

    if (type === 'display') {
      coreDisplays[key] = plugin;
    } else if (type === 'effect') {
      coreEffects[key] = plugin;
    }
  }

  library.set('displays', coreDisplays);
  library.set('effects', coreEffects);

  registerGeneratedNameLabels(
    [...Object.values(coreDisplays), ...Object.values(coreEffects)].map(
      entity => entity.config.label,
    ),
  );
}

let updateWatcherAttached = false;
const AUTO_UPDATE_CHECK_DELAY_MS = 5000;

/**
 * Kick off a background update check shortly after startup when the user has
 * automatic update checks enabled.
 */
function scheduleAutoUpdateCheck() {
  if (!getAutomaticUpdates()) {
    logger.log('Automatic update check skipped: disabled in settings');
    return;
  }

  if (!isDesktopUpdaterAvailable()) {
    logger.log('Automatic update check skipped: updater unavailable');
    return;
  }

  window.setTimeout(() => {
    logger.log('Checking for updates');
    checkForDesktopUpdates().catch(error => {
      logger.log('Update check failed:', error);
    });
  }, AUTO_UPDATE_CHECK_DELAY_MS);
}

/** Download available desktop updates in the background. */
function watchDesktopUpdates() {
  if (updateWatcherAttached) {
    return;
  }
  updateWatcherAttached = true;

  onDesktopUpdaterStatus(status => {
    if (status.state === 'available') {
      // Always download available updates; they install automatically on quit.
      downloadDesktopUpdate().catch(error => {
        logger.log('Update download failed:', error);
      });
    }
  });
}

export async function initApp() {
  if (appInitialized) {
    return;
  }

  if (appInitPromise) {
    return appInitPromise;
  }

  appInitPromise = (async () => {
    await loadPlugins();
    await loadLibrary();
    await newProject();

    renderer.start();
    appInitialized = true;
    watchDesktopUpdates();
    scheduleAutoUpdateCheck();
  })().finally(() => {
    appInitPromise = null;
  });

  return appInitPromise;
}

export default appStore;
