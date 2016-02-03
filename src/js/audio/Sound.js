'use strict';

var _ = require('lodash');
var EventEmitter = require('../core/EventEmitter.js');

var Sound = function(context) {
    this.audioContext = context;

    this.nodes = [];
    this.source = null;
    this.playing = false;
    this.paused = false;
    this.loaded = false;
    this.repeat = false;
};

Sound.prototype = _.create(EventEmitter.prototype, {
    constructor: Sound,

    addNode: function(node) {
        if (this.nodes.indexOf(node) < 0) {
            this.nodes.push(node);
        }
    },

    removeNode: function(node) {
        var index = this.nodes.indexOf(node);

        if (index > -1) {
            this.nodes.splice(index, 1);
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