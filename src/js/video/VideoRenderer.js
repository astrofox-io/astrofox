'use strict';

const path = window.require('path');

const EventEmitter = require('../core/EventEmitter');
const RenderProcess = require('./RenderProcess');
const AudioProcess = require('./AudioProcess');
const MergeProcess = require('./MergeProcess');
const { logger } = require('../core/Global');
const { removeFile } = require('../core/IO');
const { TEMP_PATH, FFMPEG_PATH } = require('../core/Environment');
const { uniqueId } = require('../util/crypto');

const defaults = {
    fps: 30,
    timeStart: 0,
    timeEnd: 0,
    format: 'mp4',
    resolution: 480
};

class VideoRenderer extends EventEmitter {
    constructor(videoFile, audioFile, options) {
        super();

        this.video = videoFile;
        this.audio = audioFile;
        this.options = Object.assign({}, defaults, options);

        this.started = false;
        this.completed = false;
        this.currentFrame = options.fps * options.timeStart;
        this.frames = this.currentFrame + (options.fps * (options.timeEnd - options.timeStart));

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

    start() {
        let id = uniqueId(),
            outputVideo = path.join(TEMP_PATH, id + '.video'),
            outputAudio = path.join(TEMP_PATH, id + '.audio'),
            { fps, timeStart, timeEnd, format } = this.options;

        logger.log('Starting render', id);

        // Start rendering
        this.renderProcess.start(outputVideo, format, fps)
            .then(file => {
                outputVideo = file;
                return this.audioProcess.start(outputAudio, format, this.audio, timeStart, timeEnd);
            })
            .then(file => {
                outputAudio = file;
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
            });

        this.emit('start');
    }

    processFrame(image) {
        logger.log('Processing', this.currentFrame, '/', this.frames);

        this.renderProcess.push(image);

        if (this.currentFrame <= this.frames) {
            this.currentFrame++;
            this.emit('ready');
        }
        else {
            this.renderProcess.push(null);
        }
    }
}

module.exports = VideoRenderer;