'use strict';

var Sound = require('./Sound.js');

var MediaElementSound = Sound.extend({
    constructor: function() {
        this.init();
    }
});

MediaElementSound.prototype.load = function(audio) {
    this.audio = audio;
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.loaded = true;

    // Doesn't work
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.processor.onaudioproces = function(e) {
        this.buffer = e.outputBuffer;
    };

    this.audio.addEventListener('playing', function() {
        this.playing = true;
        this.paused = false;
    }.bind(this));

    this.audio.addEventListener('pause', function() {
        this.playing = false;
        this.paused = true;
    }.bind(this));

    this.audio.addEventListener('ended', function() {
        this.playing = false;
        this.paused = false;
    }.bind(this));

    this.emit('load');
};

MediaElementSound.prototype.getDuration = function() {
    return this.source.duration || 0;
};

MediaElementSound.prototype.getCurrentTime = function() {
    return this.source.currentTime || 0;
};

/**
 * Start playing.
 */
MediaElementSound.prototype.play = function() {
    this.audio.play();
    this.playing = true;
    this.paused = false;

    this.emit('play');
};

/**
 * Pauses playing.
 */
MediaElementSound.prototype.pause = function() {
    this.audio.pause();
    this.playing = false;
    this.paused = true;

    this.emit('pause');
};

/**
 * Stops playing.
 */
MediaElementSound.prototype.stop = function() {
    this.audio.pause();
    this.playing = false;
    this.paused = false;

    this.emit('stop');
};

// Export
module.exports = MediaElementSound;