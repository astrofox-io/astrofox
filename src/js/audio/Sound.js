'use strict';

var _ = require('lodash');
var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');

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

    connectNode: function(node) {
        if (this.nodes.indexOf(node) < 0) {
            this.nodes.push(node);
        }
    },

    disconnectNodes: function() {
        if (this.source) {
            //this.source.disconnect();
            //this.source = null;
            this.nodes.forEach(function(node) {
                node.disconnect();
            });
        }
    },

    getPosition: function() {
        return (this.getCurrentTime() / this.getDuration()) || 0;
    }
});

module.exports = Sound;