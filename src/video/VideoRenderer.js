import path from 'path';
import EventEmitter from 'core/EventEmitter';
import RenderProcess from 'video/RenderProcess';
import AudioProcess from 'video/AudioProcess';
import MergeProcess from 'video/MergeProcess';
import { TEMP_PATH, FFMPEG_PATH, logger } from 'view/global';
import { removeFile } from 'utils/io';
import { uniqueId } from 'utils/crypto';

export default class VideoRenderer extends EventEmitter {
  static defaultProperties = {
    fps: 30,
    timeStart: 0,
    timeEnd: 0,
    format: 'mp4',
    resolution: 480,
  };

  constructor(videoFile, audioFile, properties) {
    super();

    this.video = videoFile;
    this.audio = audioFile;
    this.properties = { ...VideoRenderer.defaultProperties, ...properties };

    this.started = false;
    this.completed = false;

    this.frames = properties.fps * (properties.timeEnd - properties.timeStart);
    this.currentFrame = properties.fps * properties.timeStart;
    this.lastFrame = this.currentFrame + this.frames;

    this.renderProcess = new RenderProcess(FFMPEG_PATH);
    this.audioProcess = new AudioProcess(FFMPEG_PATH);
    this.mergeProcess = new MergeProcess(FFMPEG_PATH);
    this.currentProcess = null;
    this.startTime = 0;

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

  start() {
    const id = uniqueId();
    const { fps, timeStart, timeEnd, format } = this.properties;
    let outputVideo = path.join(TEMP_PATH, `${id}.video`);
    let outputAudio = path.join(TEMP_PATH, `${id}.audio`);

    logger.log('Starting render', id);

    this.startTime = window.performance.now();
    this.currentProcess = this.renderProcess;

    // Start rendering
    this.renderProcess
      .start(outputVideo, format, fps)
      .then(file => {
        outputVideo = file;
        this.currentProcess = this.audioProcess;
        return this.audioProcess.start(outputAudio, format, this.audio, timeStart, timeEnd);
      })
      .then(file => {
        outputAudio = file;
        this.currentProcess = this.mergeProcess;
        return this.mergeProcess.start(outputVideo, outputAudio, this.video);
      })
      .then(() => {
        if (process.env.NODE_ENV === 'production') {
          removeFile(outputVideo);
          removeFile(outputAudio);
        }

        this.completed = true;
        this.emit('complete');
      })
      .catch(err => {
        logger.error(err);

        this.completed = true;
        this.emit('complete');
      });

    this.emit('start');
  }

  stop() {
    if (!this.completed && this.currentProcess) {
      this.currentProcess.stop();
    }
  }

  processFrame(image) {
    if (this.completed) return;

    try {
      this.renderProcess.push(image);

      if (this.currentFrame < this.lastFrame) {
        this.currentFrame += 1;
        this.emit('ready');
      } else {
        this.renderProcess.push(null);
      }
    } catch (error) {
      if (error.message.indexOf('write EPIPE') < 0) {
        throw error;
      }
    }
  }
}
