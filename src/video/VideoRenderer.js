import path from 'path';
import EventEmitter from 'core/EventEmitter';
import RenderProcess from 'video/RenderProcess';
import AudioProcess from 'video/AudioProcess';
import MergeProcess from 'video/MergeProcess';
import { api, logger } from 'view/global';
import { uniqueId } from 'utils/crypto';

export default class VideoRenderer extends EventEmitter {
  constructor(renderer) {
    super();

    const { FFMPEG_PATH } = api.getEnvironment();

    this.renderer = renderer;
    this.renderProcess = new RenderProcess(FFMPEG_PATH);
    this.audioProcess = new AudioProcess(FFMPEG_PATH);
    this.mergeProcess = new MergeProcess(FFMPEG_PATH);

    this.renderProcess.on('data', data => {
      logger.log(data.toString());

      // Start requesting frames
      if (!this.started) {
        this.started = true;
        this.emit('ready');
      }
    });

    this.audioProcess.on('data', data => {
      logger.log(data.toString());
    });

    this.mergeProcess.on('data', data => {
      logger.log(data.toString());
    });
  }

  init(properties) {
    const { videoFile, audioFile, ...config } = properties;

    this.videoFile = videoFile;
    this.audioFile = audioFile;
    this.config = config;

    const { fps, timeStart, timeEnd } = config;

    this.started = false;
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
      const { fps, timeStart, timeEnd, format } = this.config;
      const { TEMP_PATH } = api.getEnvironment();
      const tempVideoFile = path.join(TEMP_PATH, `${id}.video`);
      const tempAudioFile = path.join(TEMP_PATH, `${id}.audio`);

      logger.log('Starting video render', id);

      this.on(
        'ready',
        async () => {
          const image = await this.renderer.renderFrame(this.currentFrame, fps);
          this.processFrame(image);
        },
        this,
      );

      // Render video
      this.currentProcess = renderProcess;
      const outputVideoFile = await renderProcess.start(tempVideoFile, format, fps);

      // Render audio
      this.currentProcess = audioProcess;
      const outputAudioFile = await audioProcess.start(
        audioFile,
        tempAudioFile,
        format,
        timeStart,
        timeEnd,
      );

      // Merge audio and video
      this.currentProcess = mergeProcess;
      await mergeProcess.start(outputVideoFile, outputAudioFile, videoFile);

      // Remove temp files
      if (process.env.NODE_ENV === 'production') {
        await api.removeFile(outputVideoFile);
        await api.removeFile(outputAudioFile);
      }
    } catch (error) {
      logger.error(error);

      throw error;
    } finally {
      this.finished = true;

      this.emit('finished');
      this.off('ready');

      this.renderer.start();
    }
  }

  stop() {
    if (!this.finished && this.currentProcess) {
      this.currentProcess.stop();

      logger.log('Video rendering stopped.');
    }
  }

  processFrame(image) {
    if (this.finished) return;

    const { renderProcess, frames, currentFrame, lastFrame, startTime } = this;

    try {
      renderProcess.push(image);

      if (currentFrame < lastFrame) {
        this.currentFrame += 1;
        this.emit('ready');
      } else {
        renderProcess.push(null);
      }

      this.emit('stats', { frames, currentFrame, lastFrame, startTime });
    } catch (error) {
      if (error.message.indexOf('write EPIPE') < 0) {
        throw error;
      }
    }
  }
}
