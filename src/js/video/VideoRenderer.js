"use strict";

const path = window.require('path');

const EventEmitter = require('../core/EventEmitter');
const RenderProcess = require('./RenderProcess');
const AudioProcess = require('./AudioProcess');
const MergeProcess = require('./MergeProcess');
const { Logger } = require('../core/Global');
const { removeFile } = require('../core/IO');

const defaults = {
    fps: 29.97,
    timeStart: 0,
    timeEnd: 0,
    format: 'mp4',
    resolution: 480
};

class VideoRenderer extends EventEmitter {
    constructor(videoFile, audioFile, options) {
        super();

        this.started = false;
        this.completed = false;
        this.options = Object.assign({}, defaults, options);

        let { command, fps } = this.options,
            duration = options.timeEnd - options.timeStart,
            tempVideoFile = videoFile + '.video' + path.extname(videoFile),
            tempAudioFile = videoFile + '.audio' + path.extname(audioFile);

        this.currentFrame = options.fps * options.timeStart;
        this.frames = this.currentFrame + (options.fps * duration);

        this.renderProcess = new RenderProcess(
            command,
            {
                fps: fps,
                outputFile: tempVideoFile
            }
        );

        this.audioProcess = new AudioProcess(
            command,
            {
                audioFile: audioFile,
                start: options.timeStart,
                duration: duration,
                outputFile: tempAudioFile
            }
        );

        this.mergeProcess = new MergeProcess(
            command,
            {
                videoFile: tempVideoFile,
                audioFile: tempAudioFile,
                outputFile: videoFile
            }
        );

        this.mergeProcess.on('close', () => {
            removeFile(tempVideoFile);
            removeFile(tempAudioFile);
        })
    }

    start() {
        let render = this.renderProcess;

        render.on('stderr', data => {
            Logger.log(data.toString());

            if (!this.started) {
                Logger.timeStart('video');
                this.started = true;
                this.emit('ready');
            }
        });

        render.on('close', () => {
            Logger.timeEnd('video', 'Video created.');

            this.audioProcess.on('close', () => {
                Logger.log('Audio created.');

                this.mergeProcess.on('close', () => {
                    Logger.log('Audio and video merged.');

                    this.completed = true;

                    this.emit('complete');
                });

                this.mergeProcess.on('stderr', data => {
                    Logger.log(data.toString());
                });

                this.mergeProcess.start();
            });

            this.audioProcess.on('stderr', data => {
                Logger.log(data.toString());
            });

            this.audioProcess.start();
        });

        render.start();

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
            this.renderProcess.end();
        }
    }
}

module.exports = VideoRenderer;