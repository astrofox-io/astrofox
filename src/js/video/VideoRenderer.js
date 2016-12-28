'use strict';

const remote = window.require('electron').remote;
const path = window.require('path');

const EventEmitter = require('../core/EventEmitter');
const RenderProcess = require('./RenderProcess');
const AudioProcess = require('./AudioProcess');
const MergeProcess = require('./MergeProcess');
const { Logger, Events, TEMP_PATH, FFMPEG_PATH } = require('../core/Global');
const { removeFile } = require('../core/IO');
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
            Logger.log(data.toString());

            // Start requesting frames
            if (!this.started) {
                this.started = true;
                this.emit('ready');
            }
        });

        this.audioProcess.on('data', data => {
            Logger.log(data.toString());
        });

        this.mergeProcess.on('data', data => {
            Logger.log(data.toString());
        });
    }

    start() {
        let id = uniqueId(),
            { fps, timeStart, timeEnd, format } = this.options,
            audioFile, videoFile;

        Logger.log('Starting render', id);

        // Start rendering
        this.renderProcess.start(id, fps, format)
            .then(file => {
                videoFile = file;
                return this.audioProcess.start(id, this.audio, timeStart, timeEnd - timeStart);
            })
            .then(file => {
                audioFile = file;
                return this.mergeProcess.start(videoFile, audioFile, this.video);
            })
            .then(() => {
                removeFile(videoFile);
                removeFile(audioFile);

                this.completed = true;
                this.emit('complete');
            })
            .catch(err => {
                Logger.error(err);
            });

        this.emit('start');
    }

    processFrame(image) {
        Logger.log('Processing', this.currentFrame, '/', this.frames);

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