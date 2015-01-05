'use strict';

var Sound = require('./Sound.js');

var BufferedSound = Sound.extend({
    constructor: function() {
        this.startTime = 0;
        this.stopTime = 0;
        this.init();
    }
});

BufferedSound.prototype.load = function(src) {
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
};

// Loads a url via AJAX
BufferedSound.prototype.loadUrl = function(src) {
    var request = new XMLHttpRequest();

    this.src = src;

    request.open('GET', this.src, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        this.loadData(request.response);
    }.bind(this);

    request.send();
};

// Decodes an ArrayBuffer into an AudioBuffer
BufferedSound.prototype.loadData = function(data) {
    this.audioContext.decodeAudioData(
        data,
        function(buffer) {
            this.loadBuffer(buffer);
        }.bind(this),
        function(e){
            alert('Failed to decode data');
            this.emit('error');
        }.bind(this)
    );
};

// Loads an AudioBuffer
BufferedSound.prototype.loadBuffer = function(buffer) {
    this.buffer = buffer;
    this.initBuffer();
    this.loaded = true;
    this.emit('load');
};

BufferedSound.prototype.initBuffer = function() {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;

    this.nodes.forEach(function(node){
        this.source.connect(node);
    }.bind(this));
};

BufferedSound.prototype.getCurrentTime = function() {
    if (this.playing) {
        return this.stopTime + (this.audioContext.currentTime - this.startTime);
    }
    else {
        return this.stopTime;
    }
};

BufferedSound.prototype.getDuration = function() {
    return this.buffer.duration;
};

BufferedSound.prototype.updatePosition = function(pos) {
    this.stopTime = ~~(pos * this.buffer.duration);
};

BufferedSound.prototype.play = function() {
    if (!this.loaded) return;

    this.initBuffer();

    this.startTime = this.audioContext.currentTime;
    this.source.start(0, this.getCurrentTime());
    this.playing = true;
    this.paused = false;

    this.emit('play');
};

BufferedSound.prototype.pause = function() {
    this.source.stop();
    this.stopTime += this.audioContext.currentTime - this.startTime;
    this.playing = false;
    this.paused = true;

    this.emit('pause');
};

BufferedSound.prototype.stop = function() {
    this.source.stop();
    this.stopTime = 0;
    this.playing = false;
    this.paused = false;

    this.emit('stop');
};

BufferedSound.prototype.seek = function(pos) {
    if (this.playing) {
        this.stop();
        this.updatePosition(pos);
        this.play();
    }
    else {
        this.updatePosition(pos);
    }
};

module.exports = BufferedSound;