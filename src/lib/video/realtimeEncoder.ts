import { finalizeWebm } from '@/lib/utils/webm';
import type { VideoQuality } from './encoders';
import type { ExportEncoder } from './exportEncoder';
import type { ExportOutput } from './exportPlan';

const RECORDING_TIMESLICE_MS = 250;
/** Stop this close to the range end: the transport's last tick rarely lands on it exactly. */
const END_TOLERANCE = 1e-3;

/** MediaRecorder bitrate per quality level. */
const BITS_PER_SECOND: Record<VideoQuality, number> = {
  low: 4_000_000,
  medium: 8_000_000,
  high: 16_000_000,
};

const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
];

/** The best format this browser can record, or null when it cannot record video. */
export function supportedRecordingMimeType(): string | null {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return null;
  }

  return MIME_CANDIDATES.find(mimeType => window.MediaRecorder.isTypeSupported(mimeType)) || null;
}

export function recordingExtension(mimeType: string) {
  return mimeType.includes('mp4') ? 'mp4' : 'webm';
}

export interface CaptureStreamCanvas {
  captureStream: (frameRate?: number) => MediaStream;
}

/** The part of the transport a realtime export drives. */
export interface RecordingTransport {
  seek(time: number): void;
  play(): void;
  pause(): void;
  setLoop(loop: boolean): void;
  getState(): { playing: boolean; time: number; loop: boolean };
  subscribe(listener: (state: { playing: boolean; time: number }) => void): () => void;
}

export interface RealtimeEncoderDeps {
  canvas: CaptureStreamCanvas;
  mimeType: string;
  audioContext: AudioContext;
  /** The node carrying the project audio (the player's output). */
  audioNode: AudioNode;
  transport: RecordingTransport;
  /** Write the finished file to the export's output. */
  save(output: ExportOutput, blob: Blob, fileName: string): Promise<void>;
}

/**
 * Realtime export: MediaRecorder captures the stage canvas (and the project
 * audio) while the transport plays the range, past the end of the audio too.
 * It ends at the range end, or earlier when playback stops for any reason,
 * and saves what it recorded either way.
 */
export function createRealtimeEncoder(deps: RealtimeEncoderDeps): ExportEncoder {
  const { transport } = deps;

  return {
    async run(plan, onProgress) {
      onProgress({ status: 'preparing' });

      const extension = recordingExtension(deps.mimeType);
      const fileName =
        plan.output.path ||
        plan.output.handle?.name ||
        plan.output.name ||
        `video-${Date.now()}.${extension}`;
      const previousLoop = transport.getState().loop;
      const durationMs = Math.max(250, Math.round((plan.endTime - plan.startTime) * 1000));
      let audioDestination: MediaStreamAudioDestinationNode | null = null;
      let stream: MediaStream | null = null;
      let stopWatching: (() => void) | null = null;

      const cleanup = () => {
        stopWatching?.();
        stopWatching = null;
        transport.pause();
        transport.setLoop(previousLoop);

        if (audioDestination) {
          try {
            deps.audioNode.disconnect(audioDestination);
          } catch {
            // The node may already be gone.
          }
        }

        for (const track of stream?.getTracks() || []) {
          track.stop();
        }
      };

      try {
        if (deps.audioContext.state === 'suspended') {
          await deps.audioContext.resume();
        }

        const tracks = [...deps.canvas.captureStream(plan.fps).getVideoTracks()];

        if (plan.includeAudio) {
          audioDestination = deps.audioContext.createMediaStreamDestination();
          deps.audioNode.connect(audioDestination);
          tracks.push(...audioDestination.stream.getAudioTracks());
        }

        stream = new MediaStream(tracks);

        const recorder = new window.MediaRecorder(stream, {
          mimeType: deps.mimeType,
          videoBitsPerSecond: BITS_PER_SECOND[plan.quality],
        });
        const chunks: Blob[] = [];
        let startedAt = 0;

        const recorded = new Promise<Blob>((resolve, reject) => {
          recorder.ondataavailable = event => {
            if (event.data && event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          recorder.onstart = () => {
            startedAt = performance.now();
          };
          recorder.onerror = event => {
            reject(
              (event as Event & { error?: DOMException }).error ?? new Error('Recording failed.'),
            );
          };
          recorder.onstop = () => resolve(new Blob(chunks, { type: deps.mimeType }));
        });

        transport.pause();
        transport.setLoop(false);
        transport.seek(plan.startTime);

        stopWatching = transport.subscribe(state => {
          if (!state.playing || state.time >= plan.endTime - END_TOLERANCE) {
            transport.pause();

            if (recorder.state === 'recording') {
              recorder.stop();
            }
          } else {
            onProgress({ status: 'recording', time: state.time });
          }
        });

        recorder.start(RECORDING_TIMESLICE_MS);
        transport.play();
        onProgress({ status: 'recording', time: plan.startTime });

        const raw = await recorded;

        onProgress({ status: 'saving' });

        // MediaRecorder leaves WebM files "unfinished" (no duration, unknown
        // segment/cluster sizes). Browsers tolerate that, but many desktop
        // players show black video with no audio until the container is fixed.
        const elapsedMs = startedAt ? performance.now() - startedAt : durationMs;
        const blob = await finalizeWebm(raw, elapsedMs);

        await deps.save(plan.output, blob, fileName);
        onProgress({ status: 'finished' });

        return fileName;
      } finally {
        cleanup();
      }
    },

    cancel() {
      // Stopping playback ends the recording, which is then saved.
      transport.pause();
    },
  };
}
