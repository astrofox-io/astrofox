'use strict';

var EventEmitter = require('../core/EventEmitter.js');

var Sound = EventEmitter.extend({});

Sound.prototype.init = function(context) {
    this.nodes = [];
    this.source = null;
    this.playing = false;
    this.paused = false;
    this.loaded = false;
    this.repeat = false;

    this.audioContext = context || AstroFox.getAudioContext();
    this.volume = this.audioContext.createGain();
};

Sound.prototype.connect = function(node) {
    if (this.nodes.indexOf(node) < 0) {
        this.nodes.push(node);
    }
    this.volume.connect(node);
};

Sound.prototype.disconnect = function() {
    this.volume.disconnect();
    if (this.source) this.source.disconnect();
};

Sound.prototype.setVolume = function(val) {
    if (this.loaded) {
        this.source.gain.value = val;
    }
};

Sound.prototype.getVolume = function() {
    return this.source.gain.value || 0;
};

Sound.prototype.getProgress = function() {
    return (this.getCurrentTime() / this.getDuration()) || 0;
};

// Classes should implement these methods
Sound.prototype.play = function() {};
Sound.prototype.pause = function() {};
Sound.prototype.stop = function() {};
Sound.prototype.seek = function() {};

module.exports = Sound;