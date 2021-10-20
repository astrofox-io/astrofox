import path from 'path-browserify';
import RenderProcess from 'video/RenderProcess';
import AudioProcess from 'video/AudioProcess';
import MergeProcess from 'video/MergeProcess';
import { api, logger } from 'view/global';
import { stopRender, updateState } from 'actions/video';
import { uniqueId } from 'utils/crypto';
import { raiseError } from '../view/actions/error';

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
      if (!this.running) {
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

  init(properties) {
    const { videoFile, audioFile, ...config } = properties;

    this.videoFile = videoFile;
    this.audioFile = audioFile;
    this.config = config;

    const { fps, timeStart, timeEnd } = config;

    this.running = false;
    this.finished = false;
    this.currentProcess = null;
    this.startTime = 0;

    this.frames = fps * (timeEnd - timeStart);
    this.currentFrame = fps * timeStart;
    this.lastFrame = this.currentFrame + this.frames;
  }

  async start() {
    try {
      this.renderer.stop();
      this.startTime = Date.now();

      const id = uniqueId();
      const { audioFile, videoFile, renderProcess, audioProcess, mergeProcess } = this;
      const { fps, quality, timeStart, timeEnd, codec } = this.config;
      const { TEMP_PATH } = api.getEnvironment();
      const tempVideoFile = path.join(TEMP_PATH, `${id}.video`);
      const tempAudioFile = path.join(TEMP_PATH, `${id}.audio`);

      logger.log('Starting video render', id);

      // Render video
      updateState({ status: 'Rendering video' });
      this.currentProcess = renderProcess;
      const outputVideoFile = await renderProcess.start(tempVideoFile, codec, fps, quality);

      // Render audio
      updateState({ status: 'Rendering audio' });
      this.currentProcess = audioProcess;
      const outputAudioFile = await audioProcess.start(
        audioFile,
        tempAudioFile,
        codec,
        timeStart,
        timeEnd,
      );

      // Merge audio and video
      updateState({ status: 'Merging audio and video' });
      this.currentProcess = mergeProcess;
      await mergeProcess.start(outputVideoFile, outputAudioFile, videoFile);

      this.finished = true;

      updateState({ status: 'Finished', finished: true });
    } catch (error) {
      if (error.message.indexOf('Process terminated') < 0) {
        updateState({ status: 'Error' });

        raiseError('Video rendering failed.', error);

        this.stop();
      }
    } finally {
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
    const {
      renderer,
      renderProcess,
      frames,
      startTime,
      config: { fps },
    } = this;

    try {
      while (this.currentFrame < this.lastFrame && this.running) {
        const image = await renderer.renderFrame(this.currentFrame, fps);

        renderProcess.push(image);

        this.currentFrame += 1;

        updateState({
          frames,
          currentFrame: this.currentFrame,
          lastFrame: this.lastFrame,
          startTime,
        });
      }
    } catch (error) {
      if (error.message.indexOf('write EPIPE') < 0) {
        raiseError('Frame rendering failed.');

        this.stop();
      }
    } finally {
      renderProcess.end();
    }
  }
}
