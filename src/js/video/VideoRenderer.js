"use strict";

var _ = require('lodash');

var Class = require('../core/Class.js');
var EventEmitter = require('../core/EventEmitter.js');
var IO = require('../IO.js');

var defaults = {
    fps: 30,
    frames: 0
};

var VideoRenderer = function(videoFile, audioFile, options) {
    this.options = _.assign({}, defaults, options);

    this.stream = new IO.Stream.Transform();
    this.videoFile = videoFile;
    this.audioFile = audioFile;
    this.started = false;
    this.completed = false;
};

VideoRenderer.prototype = _.create(EventEmitter.prototype, {
    constructor: VideoRenderer,

    processFrame: function(frame, image) {
        var stream = this.stream,
            func = this.func,
            options = this.options;

        if (frame < options.frames) {
            stream.push(image);
            func(frame, options.fps, this.processFrame.bind(this));
        }
        else {
            this.completed = true;
            stream.push(null);
        }
    },

    renderVideo: function(func, callback) {
        var options = this.options,
            stream = this.stream;

        this.func = func;
        this.started = false;
        this.completed = false;

        // DEBUG
        console.log('rending movie', options.frames/options.fps, 'seconds /', options.fps, 'fps /', options.frames, 'frames');

        stream.on('error', function(err) {
            console.error(err);
        });

        var ffmpeg = IO.Spawn(
            './bin/ffmpeg.exe',
            [
                '-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', options.fps,
                '-i', 'pipe:0', '-vcodec', 'libx264', '-movflags', '+faststart',
                '-pix_fmt', 'yuv420p', '-f', 'mp4', '-stats',
                this.videoFile + '.tmp'
            ]
        );

        stream.pipe(ffmpeg.stdin);

        ffmpeg.stderr.on('data', function(data) {
            console.log(data.toString());

            if (!this.started) {
                func(0, options.fps, this.processFrame.bind(this));
                this.started = true;
            }
        }.bind(this));

        ffmpeg.stderr.on('end', function() {
            console.log('file has been converted succesfully');
            //if (callback) callback();
        });

        ffmpeg.stderr.on('exit', function() {
            console.log('child process exited');
        });

        ffmpeg.stderr.on('close', function() {
            console.log('program closed');

            if (this.completed) {
                this.copyAudio(this.audioFile);
            }
        }.bind(this));
    },

    copyAudio: function(audioFile) {
        var ffmpeg = IO.Spawn(
            './bin/ffmpeg.exe',
            [
                '-y',
                '-i', this.videoFile + '.tmp',
                '-i', audioFile,
                '-codec', 'copy', '-shortest',
                this.videoFile
            ]
        );

        ffmpeg.stderr.on('data', function(data) {
            console.log(data.toString());
        }.bind(this));

        ffmpeg.stderr.on('end', function() {
            console.log('audio added succesfully');
        });

        ffmpeg.stderr.on('exit', function() {
            console.log('child process exited');
        });

        ffmpeg.stderr.on('close', function() {
            console.log('program closed');
        });
    }
});

module.exports = VideoRenderer;