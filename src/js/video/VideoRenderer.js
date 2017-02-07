import path from 'path';

import EventEmitter from '../core/EventEmitter';
import RenderProcess from './RenderProcess';
import AudioProcess from './AudioProcess';
import MergeProcess from './MergeProcess';
import { logger } from '../core/Global';
import { removeFile } from '../util/io';
import { TEMP_PATH, FFMPEG_PATH } from '../core/Environment';
import { uniqueId } from '../util/crypto';

const defaults = {
    fps: 30,
    timeStart: 0,
    timeEnd: 0,
    format: 'mp4',
    resolution: 480
};

export default class VideoRenderer extends EventEmitter {
    constructor(videoFile, audioFile, options) {
        super();

        this.video = videoFile;
        this.audio = audioFile;
        this.options = Object.assign({}, defaults, options);

        this.started = false;
        this.completed = false;
        this.currentFrame = options.fps * options.timeStart;
        this.frames = this.currentFrame + (options.fps * (options.timeEnd - options.timeStart));
        this.startTime = window.performance.now();

        this.renderProcess = new RenderProcess(FFMPEG_PATH);
        this.audioProcess = new AudioProcess(FFMPEG_PATH);
        this.mergeProcess = new MergeProcess(FFMPEG_PATH);
        this.currentProcess = null;

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
        let id = uniqueId(),
            outputVideo = path.join(TEMP_PATH, id + '.video'),
            outputAudio = path.join(TEMP_PATH, id + '.audio'),
            { fps, timeStart, timeEnd, format } = this.options;

        logger.log('Starting render', id);

        this.currentProcess = this.renderProcess;

        // Start rendering
        this.renderProcess.start(outputVideo, format, fps)
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

            if (this.currentFrame < this.frames) {
                this.currentFrame++;
                this.emit('ready');
            }
            else {
                this.renderProcess.push(null);
            }
        }
        catch (error) {
            if (error.message.indexOf('write EPIPE') < 0) {
                throw error;
            }
        }
    }
}