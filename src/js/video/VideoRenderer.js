"use strict";

const EventEmitter = require('../core/EventEmitter');
const RenderProcess = require('./RenderProcess');
const AudioProcess = require('./AudioProcess');
const { Logger } = require('../core/Global');

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
        //this.frames = options.fps * (options.timeEnd - options.timeEnd);
        this.frames = 60;
        this.currentFrame = 1;

        let { command, fps } = this.options;

        this.renderProcess = new RenderProcess(
            command,
            {
                fps: fps,
                output: videoFile + '.tmp'
            }
        );

        this.audioProcess = new AudioProcess(
            command,
            {
                audioFile: audioFile,
                videoFile: videoFile + '.tmp',
                output: videoFile
            }
        );
    }

    start() {
        let render = this.renderProcess;

        render.on('data', data => {
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
                this.completed = true;

                Logger.log('Audio copied.');

                this.emit('complete');
            });

            this.audioProcess.start();
        });

        render.start();

        this.emit('start');
    }

    processFrame(image) {
        console.log('Processing', this.currentFrame, '/', this.frames);
        this.renderProcess.push(image);

        if (this.currentFrame < this.frames) {
            this.currentFrame++;
            this.emit('ready');
        }
        else {
            this.renderProcess.end();
        }
    }
}

module.exports = VideoRenderer;