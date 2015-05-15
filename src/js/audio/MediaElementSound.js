'use strict';

var Class = require('../core/Class.js');
var Sound = require('./Sound.js');
var _ = require('lodash');


var MediaElementSound = function(context) {
    Sound.call(this, context);
};

Class.extend(MediaElementSound, Sound, {
    load: function(audio) {
        this.audio = audio;
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.loaded = true;

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
    },

    getDuration: function() {
        return this.source.duration || 0;
    },

    getCurrentTime: function() {
        return this.source.currentTime || 0;
    },

    play: function() {
        this.audio.play();
        this.playing = true;
        this.paused = false;

        this.emit('play');
    },

    pause: function() {
        this.audio.pause();
        this.playing = false;
        this.paused = true;

        this.emit('pause');
    },

    stop: function() {
        this.audio.pause();
        this.playing = false;
        this.paused = false;

        this.emit('stop');
    }
});

module.exports = MediaElementSound;