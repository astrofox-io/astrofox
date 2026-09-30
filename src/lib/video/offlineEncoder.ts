import { platform } from '@/lib/platform';
import type { ExportEncoder } from './exportEncoder';
import VideoExporter from './VideoExporter';

export interface OfflineEncoderDeps {
  /** The loaded audio file, for exports that include audio. */
  getAudioFile(): File | null;
}

function nativePath(file: File): string | null {
  const withPath = file as File & { path?: string; filePath?: string };
  return withPath.path || withPath.filePath || null;
}

/**
 * ffmpeg needs the audio on disk: use the file's own path when it was opened
 * from disk, otherwise write a temp copy that is deleted afterwards.
 */
async function audioOnDisk(file: File) {
  const existing = nativePath(file);

  if (existing) {
    return { path: existing, temporary: null };
  }

  const { files } = platform;

  if (!files) {
    throw new Error('Cannot write the audio for ffmpeg: no file system access.');
  }

  const extension = file.name?.match(/\.([a-z0-9]+)$/i)?.[1] || 'bin';
  const path = await files.writeTemp(
    `export-audio-${Date.now()}.${extension}`,
    await file.arrayBuffer(),
  );

  return { path, temporary: path };
}

/** Offline export: each frame rendered at its project time and piped to ffmpeg. */
export function createOfflineEncoder({ getAudioFile }: OfflineEncoderDeps): ExportEncoder {
  const exporter = new VideoExporter();

  return {
    async run(plan, onProgress) {
      onProgress({ status: 'preparing' });

      const audioFile = plan.includeAudio ? getAudioFile() : null;

      if (plan.includeAudio && !audioFile) {
        throw new Error('The audio file is no longer loaded.');
      }

      const audio = audioFile ? await audioOnDisk(audioFile) : null;

      try {
        return await exporter.export({
          outputPath: plan.output.path ?? '',
          audioFilePath: audio?.path ?? null,
          includeAudio: Boolean(audio),
          startTime: plan.startTime,
          endTime: plan.endTime,
          fps: plan.fps,
          encoder: plan.encoder,
          quality: plan.quality,
          overwrite: plan.overwrite,
          onProgress,
        });
      } finally {
        if (audio?.temporary) {
          await platform.files?.removeTemp(audio.temporary).catch(() => {});
        }
      }
    },

    cancel() {
      exporter.cancel();
    },
  };
}
