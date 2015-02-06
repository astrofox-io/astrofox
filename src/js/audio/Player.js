'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');

var defaults = {
    updateInterval: 500
};

var Player = EventEmitter.extend({
    constructor: function(context, options) {
        this.audioContext = context;
        this.nodes = [];
        this.sounds = {};

        this.volume = this.audioContext.createGain();
        this.volume.connect(this.audioContext.destination);
        this.options = _.assign({}, defaults);

        this.configure(options);
    }
});

Player.prototype.configure = function(options) {
    if (typeof options !== 'undefined') {
        for (var prop in options) {
            if (this.options.hasOwnProperty(prop)) {
                this.options[prop] = options[prop];
            }
        }
    }
};

Player.prototype.load = function(id, sound, callback) {
    this.unload(id);

    this.sounds[id] = sound;

    sound.connect(this.volume);

    if (callback) callback();

    this.emit('load');
};

Player.prototype.unload = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        this.stop(id);
        sound.unload();
    }
};

Player.prototype.play = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        if (sound.playing) {
            sound.pause();
        }
        else {
            sound.play();

            this.timer = setInterval(function(){
                this.emit('time');

                if (!sound.repeat && sound.getPosition(id) >= 1.0) {
                    this.stop(id);
                }
            }.bind(this), this.options.updateInterval);

            this.emit('play');
        }
    }
};

Player.prototype.pause = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        sound.pause();
        clearInterval(this.timer);
        this.emit('pause');
    }
};

Player.prototype.stop = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        sound.stop();
        clearInterval(this.timer);
        this.emit('stop');
    }
};

Player.prototype.seek = function(id, val) {
    var sound = this.sounds[id];
    if (sound) {
        sound.seek(val);
        this.emit('seek');
    }
};

Player.prototype.getSound = function(id) {
    return this.sounds[id];
};

Player.prototype.setVolume = function(val) {
    if (this.volume) {
        this.volume.gain.value = val;
    }
};

Player.prototype.getVolume = function() {
    return this.volume.gain.value;
};

Player.prototype.getCurrentTime = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        return sound.getCurrentTime();
    }
    return 0;
};

Player.prototype.getDuration = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        return sound.getDuration();
    }
    return 0;
};

Player.prototype.getPosition = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        return sound.getPosition();
    }
    return 0;
};

Player.prototype.isPlaying = function() {
    for (var id in this.sounds) {
        if (this.sounds.hasOwnProperty(id) && this.sounds[id].playing) return true;
    }

    return false;
};

module.exports = Player;