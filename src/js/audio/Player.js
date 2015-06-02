'use strict';

var Class = require('../core/Class.js');
var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');

var defaults = {
    loop: false,
    updateInterval: 500
};

var Player = function(context, options) {
    this.audioContext = context;
    this.nodes = [];
    this.sounds = {};

    this.volume = this.audioContext.createGain();
    this.volume.connect(this.audioContext.destination);
    this.options = _.assign({}, defaults);

    this.init(options);
};

Class.extend(Player, EventEmitter, {
    init: function(options) {
        if (typeof options !== 'undefined') {
            for (var prop in options) {
                if (this.options.hasOwnProperty(prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }
    },

    load: function(id, sound, callback) {
        this.unload(id, function() {
            this.sounds[id] = sound;

            sound.addNode(this.volume);

            if (callback) callback();

            this.emit('load');
        }.bind(this));
    },

    unload: function(id, callback) {
        var sound = this.sounds[id];
        if (sound) {
            this.stop(id);
            sound.unload(callback);
        }
        else if (callback) {
            callback();
        }
    },

    play: function(id) {
        var sound = this.sounds[id];
        if (sound) {
            if (sound.playing) {
                this.pause(id);
            }
            else {
                sound.play();

                this.timer = setInterval(
                    function() {
                        if (!sound.repeat && sound.getPosition(id) >= 1.0) {
                            if (this.options.loop) {
                                this.seek(id, 0);
                            }
                            else {
                                this.stop(id);
                            }
                        }

                        this.emit('tick');
                    }.bind(this),
                    this.options.updateInterval
                );

                this.emit('play');
            }
        }
    },

    pause: function(id) {
        var sound = this.sounds[id];
        if (sound) {
            sound.pause();
            clearInterval(this.timer);
            this.emit('pause');
        }
    },

    stop: function(id) {
        var sound = this.sounds[id];
        if (sound) {
            sound.stop();
            clearInterval(this.timer);
            this.emit('stop');
        }
    },

    seek: function(id, val) {
        var sound = this.sounds[id];
        if (sound) {
            sound.seek(val);
            this.emit('seek');
        }
    },

    getSound: function(id) {
        return this.sounds[id];
    },

    setVolume: function(val) {
        if (this.volume) {
            this.volume.gain.value = val;
        }
    },

    getVolume: function() {
        return this.volume.gain.value;
    },

    getCurrentTime: function(id) {
        var sound = this.sounds[id];
        if (sound) {
            return sound.getCurrentTime();
        }
        return 0;
    },

    getDuration: function(id) {
        var sound = this.sounds[id];
        if (sound) {
            return sound.getDuration();
        }
        return 0;
    },

    getPosition: function(id) {
        var sound = this.sounds[id];
        if (sound) {
            return sound.getPosition();
        }
        return 0;
    },

    toggleLoop: function() {
        this.options.loop = !this.options.loop;
    },

    isPlaying: function() {
        for (var id in this.sounds) {
            if (this.sounds.hasOwnProperty(id) && this.sounds[id].playing) return true;
        }

        return false;
    }
});

module.exports = Player;