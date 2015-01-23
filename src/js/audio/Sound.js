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

    this.audioContext = context;
};

Sound.prototype.connect = function(node) {
    if (this.nodes.indexOf(node) < 0) {
        this.nodes.push(node);
    }
};

Sound.prototype.disconnect = function() {
    if (this.source) {
        this.source.disconnect();
    }
};

Sound.prototype.getPosition = function() {
    return (this.getCurrentTime() / this.getDuration()) || 0;
};

// Classes should implement these methods
Sound.prototype.play = function() {};
Sound.prototype.pause = function() {};
Sound.prototype.stop = function() {};
Sound.prototype.seek = function() {};

module.exports = Sound;