import path from 'path-browserify';
import RenderProcess from 'video/RenderProcess';
import AudioProcess from 'video/AudioProcess';
import MergeProcess from 'video/MergeProcess';
import { api, logger, stage } from 'view/global';
import { updateState } from 'actions/video';
import { raiseError } from 'actions/error';
import { uniqueId } from 'utils/crypto';
import { sleep } from 'utils/work';

export default class VideoRenderer {
  constructor(renderer) {
    const { FFMPEG_BINARY } = api.getEnvironment();

    this.renderer = renderer;
    this.renderProcess = new RenderProcess(FFMPEG_BINARY);
    this.audioProcess = new AudioProcess(FFMPEG_BINARY);
    this.mergeProcess = new MergeProcess(FFMPEG_BINARY);

    this.renderProcess.on('output', data => {
      logger.log(data);

      // Start rendering frames when ffmpeg is ready
      if (/^ffmpeg version/.test(data)) {
        setTimeout(() => {
          this.running = true;

          this.renderFrames();
        }, 500);
      }
    });

    this.audioProcess.on('output', data => {
      logger.log(data);
    });

    this.mergeProcess.on('output', data => {
      logger.log(data);
    });
  }

  async start({ videoFile, audioFile, fps, quality, codec, timeStart, timeEnd }) {
    try {
      this.renderer.stop();
      this.startTime = Date.now();
      this.running = false;
      this.finished = false;
      this.currentProcess = null;
      this.fps = fps;
      this.totalFrames = fps * (timeEnd - timeStart);
      this.startFrame = fps * timeStart;
      this.endFrame = this.startFrame + this.totalFrames;

      const { renderProcess, audioProcess, mergeProcess } = this;

      const id = uniqueId();
      const { TEMP_PATH } = api.getEnvironment();
      const tempVideoFile = path.join(TEMP_PATH, `${id}.video`);
      const tempAudioFile = path.join(TEMP_PATH, `${id}.audio`);

      logger.log('Starting video render', id);

      // Render video
      updateState({ status: 'Rendering video' });
      this.currentProcess = renderProcess;
      const { width, height } = stage.getSize();
      const outputVideoFile = await renderProcess.start({
        outputFile: tempVideoFile,
        codec,
        fps,
        quality,
        width,
        height,
      });

      // Render audio
      updateState({ status: 'Rendering audio' });
      this.currentProcess = audioProcess;
      const outputAudioFile = await audioProcess.start({
        audioFile,
        outputFile: tempAudioFile,
        codec,
        timeStart,
        timeEnd,
      });

      // Merge audio and video
      updateState({ status: 'Merging audio and video' });
      this.currentProcess = mergeProcess;
      await mergeProcess.start({
        inputFiles: [outputVideoFile, outputAudioFile],
        outputFile: videoFile,
      });

      this.finished = true;

      updateState({ status: 'Finished', finished: true });
    } catch (error) {
      if (error.message.indexOf('Process terminated') < 0) {
        updateState({ status: 'Error' });

        raiseError('Video rendering failed.', error);
      }
    } finally {
      this.stop();

      this.running = false;

      this.renderer.start();
    }
  }

  stop() {
    if (!this.finished) {
      this.currentProcess?.stop();
      this.running = false;

      logger.log('Video rendering stopped.');
    }
  }

  async renderFrames() {
    const { renderer, renderProcess, startTime, startFrame, endFrame, totalFrames, fps } = this;

    try {
      this.frame = startFrame;

      while (this.frame < endFrame && this.running) {
        const image = await renderer.renderFrame(this.frame, fps);

        // This is required for the UI to respond
        await sleep(20);

        renderProcess.push(image);

        this.frame += 1;

        updateState({
          currentFrame: totalFrames - (endFrame - this.frame) ,
          totalFrames,
          startTime,
        });
      }
    } catch (error) {
      if (error.message.indexOf('write EPIPE') < 0) {
        raiseError('Frame rendering failed.', error);

        this.stop();
      }
    } finally {
      renderProcess.end();
    }
  }
}

