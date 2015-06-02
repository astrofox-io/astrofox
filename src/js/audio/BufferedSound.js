'use strict';

var _ = require('lodash');
var Class = require('core/Class.js');
var Sound = require('audio/Sound.js');

var BufferedSound = function(context) {
    Sound.call(this, context);

    this.startTime = 0;
    this.stopTime = 0;
};

Class.extend(BufferedSound, Sound, {
    load: function(src) {
        if (typeof src === 'string') {
            this.loadUrl(src);
        }
        else if (src instanceof ArrayBuffer) {
            this.loadData(src);
        }
        else if (src instanceof AudioBuffer) {
            this.loadBuffer(src);
        }
        else {
            alert('Invalid source: ' + (typeof src));
            this.emit('error');
        }
    },

    unload: function(callback) {
        if (this.source) {
            this.stop();
            this.source = null;
            this.buffer = null;
            this.off();
        }

        if (callback) callback();
    },

    // Loads a url via AJAX
    loadUrl: function(src) {
        var request = new XMLHttpRequest();

        this.src = src;

        request.open('GET', this.src, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            this.loadData(request.response);
        }.bind(this);

        request.send();
    },

    // Decodes an ArrayBuffer into an AudioBuffer
    loadData: function(data) {
        this.audioContext.decodeAudioData(
            data,
            function(buffer) {
                this.loadBuffer(buffer);
            }.bind(this),
            function(e) {
                this.emit('error', new Error('Invalid audio file.'));
            }.bind(this)
        );
    },

    // Loads an AudioBuffer
    loadBuffer: function(buffer) {
        this.buffer = buffer;
        this.initBuffer();
        this.loaded = true;
        this.emit('load');
    },

    initBuffer: function() {
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.buffer;

        this.nodes.forEach(function(node) {
            this.source.connect(node);
        }, this);
    },

    getCurrentTime: function() {
        if (this.playing) {
            return this.stopTime + (this.audioContext.currentTime - this.startTime);
        }
        else {
            return this.stopTime;
        }
    },

    getDuration: function() {
        return (this.buffer) ? this.buffer.duration : 0;
    },

    updatePosition: function(pos) {
        this.stopTime = ~~(pos * this.buffer.duration);
    },

    play: function() {
        if (!this.loaded) return;

        this.initBuffer();

        this.startTime = this.audioContext.currentTime;
        this.source.start(0, this.getCurrentTime());
        this.playing = true;
        this.paused = false;

        this.emit('play');
    },

    pause: function() {
        this.source.stop();
        this.stopTime += this.audioContext.currentTime - this.startTime;
        this.playing = false;
        this.paused = true;

        this.emit('pause');
    },

    stop: function() {
        this.source.stop();
        this.source.disconnect();
        this.stopTime = 0;
        this.playing = false;
        this.paused = false;

        this.emit('stop');
    },

    seek: function(pos) {
        if (this.playing) {
            this.stop();
            this.updatePosition(pos);
            this.play();
        }
        else {
            this.updatePosition(pos);
        }
    }
});

module.exports = BufferedSound;