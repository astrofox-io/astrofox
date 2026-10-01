import type { OfflineFrameSession } from '@/lib/core/render/offlineFrames';
import type { Encoder, NativeFiles } from '@/lib/platform/types';
import { getVideoEncoderConfig } from './encoders';
import { ExportCancelledError, type ExportEncoder, isExportCancelledError } from './exportEncoder';

export interface OfflineEncoderDeps {
  /** The platform's ffmpeg. */
  ffmpeg: Encoder;
  /** Temp files for the intermediate video and audio. */
  files: Pick<NativeFiles, 'tempPath' | 'writeTemp' | 'removeTemp'>;
  /** The loaded audio file, for exports that include audio. */
  getAudioFile(): File | null;
  /** The stage size in pixels: the size of every rendered frame. */
  stageSize(): { width: number; height: number };
  /** Render offline frames (`renderer.offline`). */
  render<T>(fps: number, work: (frames: OfflineFrameSession) => Promise<T>): Promise<T>;
  /** Give the UI a turn between frames, to show progress. */
  yieldToUI(): Promise<void>;
}

function nativePath(file: File): string | null {
  const withPath = file as File & { path?: string; filePath?: string };
  return withPath.path || withPath.filePath || null;
}

/** The output path with the encoder's extension, replacing any other. */
function withExtension(filePath: string, extension: string) {
  return new RegExp(`\\.${extension}$`, 'i').test(filePath)
    ? filePath
    : `${filePath.replace(/\.[^./\\]+$/, '')}.${extension}`;
}

/**
 * Copy a frame into a buffer of the encoded size. Encoders need even
 * dimensions, so an odd width or height gains one black column or row.
 */
function fitFrame(pixels: Uint8Array, from: Size, to: Size): Uint8Array {
  const out = new Uint8Array(to.width * to.height * 4);

  if (from.width === to.width && from.height === to.height) {
    // A standalone copy, so handing it over IPC is predictable.
    out.set(pixels.subarray(0, out.length));
    return out;
  }

  const rowBytes = Math.min(from.width, to.width) * 4;
  const rows = Math.min(from.height, to.height);

  for (let y = 0; y < rows; y += 1) {
    out.set(pixels.subarray(y * from.width * 4, y * from.width * 4 + rowBytes), y * to.width * 4);
  }

  return out;
}

type Size = { width: number; height: number };

/**
 * Offline export: each frame of the range is rendered at its project time and
 * piped to ffmpeg as raw RGBA, the audio range is encoded separately, and the
 * two are merged into the output. Intermediate files go to the temp directory
 * and are always removed.
 *
 * Cancelling kills whichever ffmpeg is running, discards the partial output
 * and rejects with an ExportCancelledError. One encoder runs one export.
 */
export function createOfflineEncoder(deps: OfflineEncoderDeps): ExportEncoder {
  const { ffmpeg, files } = deps;
  let cancelled = false;
  /** ffmpeg processes running now, by id, so a cancel can kill them. */
  const running = new Set<string>();

  function throwIfCancelled() {
    if (cancelled) {
      throw new ExportCancelledError();
    }
  }

  async function killRunning() {
    await Promise.all([...running].map(id => ffmpeg.kill(id).catch(() => {})));
  }

  /** Await an ffmpeg call; once cancelled, its failure (a killed process) is the cancel. */
  async function step<T>(work: Promise<T>): Promise<T> {
    try {
      return await work;
    } catch (error) {
      throwIfCancelled();
      throw error;
    }
  }

  /** Run one ffmpeg stage to completion under `id`. */
  async function runStage(args: string[], id: string) {
    throwIfCancelled();
    running.add(id);

    try {
      await step(ffmpeg.run(args, id));
    } finally {
      running.delete(id);
    }

    throwIfCancelled();
  }

  /**
   * ffmpeg needs the audio on disk: the file's own path when it was opened
   * from disk, otherwise a temp copy.
   */
  async function audioOnDisk(file: File, temporary: string[]) {
    const existing = nativePath(file);

    if (existing) {
      return existing;
    }

    const extension = file.name?.match(/\.([a-z0-9]+)$/i)?.[1] || 'bin';
    const path = await files.writeTemp(
      `export-audio-${Date.now()}.${extension}`,
      await file.arrayBuffer(),
    );
    temporary.push(path);
    return path;
  }

  return {
    async run(plan, onProgress) {
      onProgress({ status: 'preparing' });

      const audioFile = plan.includeAudio ? deps.getAudioFile() : null;

      if (plan.includeAudio && !audioFile) {
        throw new Error('The audio file is no longer loaded.');
      }

      if (!files.tempPath) {
        throw new Error('Desktop temp path is unavailable.');
      }

      const { fps, startTime, endTime, quality } = plan;
      const config = getVideoEncoderConfig(plan.encoder);
      const output = withExtension(plan.output.path ?? '', config.video.extension);
      const duration = endTime - startTime;

      const stage = deps.stageSize();
      const frameSize = {
        width: Math.max(1, Math.round(stage.width || 1)),
        height: Math.max(1, Math.round(stage.height || 1)),
      };
      const videoSize = {
        width: Math.max(2, Math.round(frameSize.width / 2) * 2),
        height: Math.max(2, Math.round(frameSize.height / 2) * 2),
      };
      const totalFrames = Math.max(1, Math.round(duration * fps));
      const startFrame = Math.round(startTime * fps);

      const id = `export-${Date.now()}`;
      const tempBase = `${files.tempPath.replace(/[\\/]$/, '')}/${id}`;
      const tempVideo = `${tempBase}.video.${config.video.extension}`;
      const tempAudio = `${tempBase}.audio.${config.audio.extension}`;
      const temporary = [tempVideo, tempAudio];

      try {
        const audioPath = audioFile ? await audioOnDisk(audioFile, temporary) : null;

        onProgress({ status: 'rendering-video', currentFrame: 0, totalFrames });

        throwIfCancelled();
        const pipeId = id;
        running.add(pipeId);
        await step(
          ffmpeg.startPipe(
            [
              '-y',
              '-f',
              'rawvideo',
              '-pix_fmt',
              'rgba',
              '-s',
              `${videoSize.width}x${videoSize.height}`,
              '-r',
              String(fps),
              '-i',
              'pipe:0',
              '-c:v',
              config.video.encoder,
              // Frames arrive bottom row first. Convert RGB → YUV with the BT.709
              // matrix (swscale defaults to BT.601) and tag the stream accordingly
              // so players decode the colors as intended.
              '-vf',
              'vflip,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
              '-pix_fmt',
              'yuv420p',
              '-colorspace',
              'bt709',
              '-color_primaries',
              'bt709',
              '-color_trc',
              'bt709',
              '-color_range',
              'tv',
              ...config.video.output,
              ...config.video.quality[quality],
              tempVideo,
            ],
            pipeId,
          ),
        );
        // cancel() may have raced with starting the pipe.
        throwIfCancelled();

        // The live view stays paused until every frame is rendered.
        await deps.render(fps, async frames => {
          for (let index = 0; index < totalFrames; index += 1) {
            throwIfCancelled();

            const pixels = await frames.renderAt((startFrame + index) / fps);
            await step(ffmpeg.write(pipeId, fitFrame(pixels, frameSize, videoSize)));

            if (index % 2 === 0) {
              await deps.yieldToUI();
            }

            onProgress({ status: 'rendering-video', currentFrame: index + 1, totalFrames });
          }
        });

        throwIfCancelled();
        await step(ffmpeg.endPipe(pipeId));
        running.delete(pipeId);

        if (audioPath) {
          onProgress({ status: 'rendering-audio' });
          await runStage(
            [
              '-y',
              '-i',
              audioPath,
              '-ss',
              String(startTime),
              '-t',
              String(duration),
              '-c:a',
              config.audio.encoder,
              ...config.audio.settings,
              tempAudio,
            ],
            `${id}.audio`,
          );
        }

        onProgress({ status: 'merging' });
        const overwrite = plan.overwrite ? '-y' : '-n';
        await runStage(
          audioPath
            ? [
                overwrite,
                '-i',
                tempVideo,
                '-i',
                tempAudio,
                '-c',
                'copy',
                '-shortest',
                ...config.video.merge,
                output,
              ]
            : [overwrite, '-i', tempVideo, '-c', 'copy', ...config.video.merge, output],
          `${id}.merge`,
        );

        onProgress({ status: 'finished', currentFrame: totalFrames, totalFrames });
        return output;
      } catch (error) {
        // Cancelled or failed, leave no ffmpeg running: an open pipe would hold
        // the temp video open.
        await killRunning();
        running.clear();

        if (cancelled && !isExportCancelledError(error)) {
          throw new ExportCancelledError();
        }

        throw error;
      } finally {
        for (const file of temporary) {
          await files.removeTemp(file).catch(() => {});
        }
      }
    },

    cancel() {
      cancelled = true;
      void killRunning();
    },
  };
}
