import { getDesktopBridge } from '@/app/desktop';
import { logger, renderBackend, renderer } from '@/app/global';

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
  quality?: 'low' | 'medium' | 'high';
  onProgress?: (progress: VideoExportProgress) => void;
};

function sleep(ms: number) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function ensureMp4Path(filePath: string) {
  return /\.mp4$/i.test(filePath) ? filePath : `${filePath}.mp4`;
}

function replaceExtension(filePath: string, extension: string) {
  const normalized = extension.startsWith('.') ? extension : `.${extension}`;
  return filePath.replace(/\.[^./\\]+$/, '') + normalized;
}

function qualityArgs(quality: 'low' | 'medium' | 'high'): string[] {
  switch (quality) {
    case 'low':
      return ['-preset', 'veryfast', '-crf', '23'];
    case 'high':
      return ['-preset', 'slow', '-crf', '18'];
    default:
      return ['-preset', 'medium', '-crf', '20'];
  }
}

/**
 * Offline desktop export: raw RGBA frames → libx264, optional audio, merge to MP4.
 * Requires the Electron preload ffmpeg bridge and a bundled ffmpeg binary.
 */
export default class VideoExporter {
  private cancelled = false;
  private pipeId: string | null = null;

  cancel() {
    this.cancelled = true;
    const bridge = getDesktopBridge();
    if (this.pipeId && bridge?.ffmpegKill) {
      void bridge.ffmpegKill(this.pipeId);
    }
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
      quality = 'medium',
      onProgress,
    } = options;

    const finalOutput = ensureMp4Path(outputPath);
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
    const tempVideo = replaceExtension(`${tempRoot.replace(/[\\/]$/, '')}/${id}.video`, '.mp4');
    const tempAudio = replaceExtension(`${tempRoot.replace(/[\\/]$/, '')}/${id}.audio`, '.m4a');

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
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'vflip',
        '-profile:v',
        'high',
        '-tune',
        'animation',
        '-movflags',
        '+faststart',
        ...qualityArgs(quality),
        tempVideo,
      ];

      const { id: pipeId } = await bridge.ffmpegStartPipe(videoArgs, id);
      this.pipeId = pipeId;

      for (let frame = startFrame; frame < endFrame; frame += 1) {
        if (this.cancelled) {
          throw new Error('Export cancelled.');
        }

        const pixels = await renderer.renderFrame(frame, fps);
        // Ensure even dimensions by cropping if needed.
        const frameBytes = this.normalizeFrame(pixels, width, height, w, h);
        await bridge.ffmpegWrite(pipeId, frameBytes);

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

      await bridge.ffmpegEndPipe(pipeId);
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
          'aac',
          '-b:a',
          '192k',
          tempAudio,
        ];
        await bridge.ffmpegRun?.(audioArgs);
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
            '-movflags',
            '+faststart',
            finalOutput,
          ]
        : ['-y', '-i', tempVideo, '-c', 'copy', '-movflags', '+faststart', finalOutput];
      await bridge.ffmpegRun?.(mergeArgs);

      report({ status: 'finished', currentFrame: totalFrames, totalFrames });
      logger.log('FFmpeg video export finished:', finalOutput);
      return finalOutput;
    } finally {
      this.pipeId = null;
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
