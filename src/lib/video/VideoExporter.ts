import { getDesktopBridge } from '@/app/desktop';
import { logger, renderBackend, renderer } from '@/app/global';
import { getVideoEncoderConfig, type VideoEncoder, type VideoQuality } from './encoders';

export type VideoExportProgress = {
  status: string;
  currentFrame?: number;
  totalFrames?: number;
};

export type VideoExportOptions = {
  outputPath: string;
  audioFilePath?: string | null;
  includeAudio?: boolean;
  startTime?: number;
  endTime?: number;
  fps?: number;
  encoder?: VideoEncoder;
  quality?: VideoQuality;
  onProgress?: (progress: VideoExportProgress) => void;
};

function sleep(ms: number) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function replaceExtension(filePath: string, extension: string) {
  const normalized = extension.startsWith('.') ? extension : `.${extension}`;
  return filePath.replace(/\.[^./\\]+$/, '') + normalized;
}

function ensureExtension(filePath: string, extension: string) {
  const pattern = new RegExp(`\\.${extension}$`, 'i');
  return pattern.test(filePath) ? filePath : replaceExtension(filePath, extension);
}

/**
 * Offline desktop export: raw RGBA frames → ffmpeg encoder, optional audio,
 * merge into the final container. Requires the Electron preload ffmpeg bridge
 * and a bundled ffmpeg binary.
 */
export class VideoExportCancelledError extends Error {
  readonly cancelled = true;

  constructor() {
    super('Export cancelled.');
    this.name = 'VideoExportCancelledError';
  }
}

export function isVideoExportCancelledError(error: unknown): boolean {
  return (
    error instanceof VideoExportCancelledError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { cancelled?: boolean }).cancelled === true)
  );
}

export default class VideoExporter {
  private cancelled = false;
  private pipeId: string | null = null;
  private runId: string | null = null;

  get isCancelled() {
    return this.cancelled;
  }

  cancel() {
    this.cancelled = true;
    void this.killActiveProcesses();
  }

  /** Kill the pipe encoder and any in-flight run stage (audio/merge). */
  private async killActiveProcesses() {
    const bridge = getDesktopBridge();
    if (!bridge?.ffmpegKill) return;
    const ids = [this.pipeId, this.runId].filter((value): value is string => Boolean(value));
    await Promise.all(ids.map(processId => bridge.ffmpegKill?.(processId).catch(() => {})));
  }

  private throwIfCancelled() {
    if (this.cancelled) {
      throw new VideoExportCancelledError();
    }
  }

  /** Run a one-shot ffmpeg stage under a known id so it can be cancelled. */
  private async runStage(args: string[], stageId: string) {
    const bridge = getDesktopBridge();
    if (!bridge?.ffmpegRun) {
      throw new Error('Desktop ffmpeg bridge is unavailable.');
    }
    this.throwIfCancelled();
    this.runId = stageId;
    try {
      await bridge.ffmpegRun(args, stageId);
    } catch (error) {
      // A killed stage surfaces as a non-zero exit; report it as a cancel.
      if (this.cancelled) {
        throw new VideoExportCancelledError();
      }
      throw error;
    } finally {
      this.runId = null;
    }
    this.throwIfCancelled();
  }

  async export(options: VideoExportOptions): Promise<string> {
    const bridge = getDesktopBridge();
    if (!bridge?.ffmpegStartPipe || !bridge.ffmpegWrite || !bridge.ffmpegEndPipe) {
      throw new Error('Desktop ffmpeg bridge is unavailable.');
    }

    const env = bridge.getEnvironment?.() || {};
    if (!env.FFMPEG_AVAILABLE || !env.FFMPEG_PATH) {
      throw new Error('ffmpeg is not available. Run pnpm install-ffmpeg.');
    }

    const tempRoot = String(env.TEMP_PATH || '');
    if (!tempRoot) {
      throw new Error('Desktop temp path is unavailable.');
    }

    const {
      outputPath,
      audioFilePath = null,
      includeAudio = true,
      startTime = 0,
      endTime,
      fps = 30,
      encoder = 'x264',
      quality = 'medium',
      onProgress,
    } = options;

    const config = getVideoEncoderConfig(encoder);
    const finalOutput = ensureExtension(outputPath, config.video.extension);
    const duration = Math.max(0, (endTime ?? startTime) - startTime);
    if (duration <= 0) {
      throw new Error('Invalid export duration.');
    }

    const size =
      typeof renderBackend.getSize === 'function'
        ? renderBackend.getSize()
        : { width: 1, height: 1 };
    const width = Math.max(1, Math.round(size.width || 1));
    const height = Math.max(1, Math.round(size.height || 1));
    // H.264 yuv420p requires even dimensions.
    const w = Math.max(2, Math.round(width / 2) * 2);
    const h = Math.max(2, Math.round(height / 2) * 2);
    const totalFrames = Math.max(1, Math.round(duration * fps));
    const startFrame = Math.round(startTime * fps);
    const endFrame = startFrame + totalFrames;
    const id = `export-${Date.now()}`;
    const tempBase = `${tempRoot.replace(/[\\/]$/, '')}/${id}`;
    const tempVideo = `${tempBase}.video.${config.video.extension}`;
    const tempAudio = `${tempBase}.audio.${config.audio.extension}`;

    const tempFiles = [tempVideo, tempAudio];
    const report = (progress: VideoExportProgress) => {
      onProgress?.(progress);
    };

    // Pause live render loop while exporting offline frames.
    const wasRendering = renderer.rendering;
    renderer.stop();

    try {
      report({ status: 'rendering-video', currentFrame: 0, totalFrames });

      const videoArgs = [
        '-y',
        '-f',
        'rawvideo',
        '-pix_fmt',
        'rgba',
        '-s',
        `${w}x${h}`,
        '-r',
        String(fps),
        '-i',
        'pipe:0',
        '-c:v',
        config.video.encoder,
        // Convert RGB → YUV with the BT.709 matrix (swscale defaults to BT.601)
        // and tag the stream accordingly so players decode the colors as intended.
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
      ];

      this.throwIfCancelled();
      const { id: pipeId } = await bridge.ffmpegStartPipe(videoArgs, id);
      this.pipeId = pipeId;
      // cancel() may have raced with start-pipe.
      if (this.cancelled) {
        await this.killActiveProcesses();
        throw new VideoExportCancelledError();
      }

      for (let frame = startFrame; frame < endFrame; frame += 1) {
        this.throwIfCancelled();

        const pixels = await renderer.renderFrame(frame, fps);
        // Ensure even dimensions by cropping if needed.
        const frameBytes = this.normalizeFrame(pixels, width, height, w, h);
        try {
          await bridge.ffmpegWrite(pipeId, frameBytes);
        } catch (error) {
          if (this.cancelled) {
            throw new VideoExportCancelledError();
          }
          throw error;
        }

        // Yield so the UI can update progress.
        if ((frame - startFrame) % 2 === 0) {
          await sleep(0);
        }

        report({
          status: 'rendering-video',
          currentFrame: frame - startFrame + 1,
          totalFrames,
        });
      }

      this.throwIfCancelled();
      try {
        await bridge.ffmpegEndPipe(pipeId);
      } catch (error) {
        if (this.cancelled) {
          throw new VideoExportCancelledError();
        }
        throw error;
      }
      this.pipeId = null;

      let audioOut: string | null = null;
      if (includeAudio && audioFilePath) {
        report({ status: 'rendering-audio' });
        const audioArgs = [
          '-y',
          '-i',
          audioFilePath,
          '-ss',
          String(startTime),
          '-t',
          String(duration),
          '-c:a',
          config.audio.encoder,
          ...config.audio.settings,
          tempAudio,
        ];
        await this.runStage(audioArgs, `${id}.audio`);
        audioOut = tempAudio;
      }

      report({ status: 'merging' });
      const mergeArgs = audioOut
        ? [
            '-y',
            '-i',
            tempVideo,
            '-i',
            audioOut,
            '-c',
            'copy',
            '-shortest',
            ...config.video.merge,
            finalOutput,
          ]
        : ['-y', '-i', tempVideo, '-c', 'copy', ...config.video.merge, finalOutput];
      await this.runStage(mergeArgs, `${id}.merge`);

      report({ status: 'finished', currentFrame: totalFrames, totalFrames });
      logger.log('FFmpeg video export finished:', finalOutput);
      return finalOutput;
    } catch (error) {
      // Whether this is a cancel or a failure, make sure no ffmpeg child is
      // left running (a still-open pipe would otherwise keep the main-process
      // entry alive and hold the temp video file open).
      await this.killActiveProcesses();
      if (this.cancelled && !isVideoExportCancelledError(error)) {
        throw new VideoExportCancelledError();
      }
      throw error;
    } finally {
      this.pipeId = null;
      this.runId = null;
      if (wasRendering) {
        renderer.start();
      } else {
        renderer.requestRender();
      }

      if (bridge.removePath) {
        for (const file of tempFiles) {
          try {
            await bridge.removePath(file);
          } catch {
            // best-effort cleanup
          }
        }
      }
    }
  }

  private normalizeFrame(
    pixels: Uint8Array,
    srcWidth: number,
    srcHeight: number,
    dstWidth: number,
    dstHeight: number,
  ): Uint8Array {
    if (srcWidth === dstWidth && srcHeight === dstHeight) {
      // Copy into a standalone buffer so IPC transfer stays predictable.
      const copy = new Uint8Array(pixels.byteLength);
      copy.set(pixels);
      return copy;
    }

    const out = new Uint8Array(dstWidth * dstHeight * 4);
    const rowBytes = Math.min(srcWidth, dstWidth) * 4;
    const rows = Math.min(srcHeight, dstHeight);

    for (let y = 0; y < rows; y += 1) {
      const srcOffset = y * srcWidth * 4;
      const dstOffset = y * dstWidth * 4;
      out.set(pixels.subarray(srcOffset, srcOffset + rowBytes), dstOffset);
    }

    return out;
  }
}
