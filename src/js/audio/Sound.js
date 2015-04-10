'use strict';

var Class = require('../core/Class.js');
var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');

var Sound = function(context) {
    this.audioContext = context;

    this.nodes = [];
    this.source = null;
    this.playing = false;
    this.paused = false;
    this.loaded = false;
    this.repeat = false;
};

Class.extend(Sound, EventEmitter, {
    constructor: Sound,

    connect: function(node) {
        if (this.nodes.indexOf(node) < 0) {
            this.nodes.push(node);
        }
    },

    disconnect: function() {
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
    },

    getPosition: function() {
        return (this.getCurrentTime() / this.getDuration()) || 0;
    }
});

module.exports = Sound;