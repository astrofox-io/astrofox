'use strict';

const EventEmitter = require('../core/EventEmitter.js');

const defaults = {
    loop: false,
    updateInterval: 200
};

class Player extends EventEmitter {
    constructor(context, options) {
        super();

        this.audioContext = context;
        this.nodes = [];
        this.sounds = {};

        this.volume = this.audioContext.createGain();
        this.volume.connect(this.audioContext.destination);
        this.options = Object.assign({}, defaults);

        this.update(options);
    }

    update(options) {
        if (typeof options !== 'undefined') {
            for (let prop in options) {
                if (options.hasOwnProperty(prop) && this.options.hasOwnProperty(prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }
    }

    load(id, sound, callback) {
        this.unload(id, () => {
            this.sounds[id] = sound;

            sound.addNode(this.volume);

            if (callback) callback();

            this.emit('load', id);
        });
    }

    unload(id, callback) {
        var sound = this.sounds[id];
        if (sound) {
            this.stop(id);
            sound.unload(callback);
        }
        else if (callback) {
            callback();
        }
    }

    play(id) {
        let sound = this.sounds[id];
        if (sound) {
            if (sound.playing) {
                this.pause(id);
            }
            else {
                sound.play();

                this.timer = setInterval(
                    () => {
                        if (!sound.repeat && sound.getPosition(id) >= 1.0) {
                            if (this.options.loop) {
                                this.seek(id, 0);
                            }
                            else {
                                this.stop(id);
                            }
                        }

                        this.emit('tick', id);
                    },
                    this.options.updateInterval
                );

                this.emit('play', id);
            }
        }
    }

    pause(id) {
        let sound = this.sounds[id];
        if (sound) {
            sound.pause();
            clearInterval(this.timer);
            this.emit('pause', id);
        }
    }

    stop(id) {
        let sound = this.sounds[id];
        if (sound) {
            sound.stop();
            clearInterval(this.timer);
            this.emit('stop', id);
        }
    }

    seek(id, val) {
        let sound = this.sounds[id];
        if (sound) {
            sound.seek(val);
            this.emit('seek', id);
        }
    }

    getSound(id) {
        return this.sounds[id];
    }

    setVolume(val) {
        if (this.volume) {
            this.volume.gain.value = val;
        }
    }

    getVolume() {
        return this.volume.gain.value;
    }

    getCurrentTime(id) {
        let sound = this.sounds[id];
        if (sound) {
            return sound.getCurrentTime();
        }
        return 0;
    }

    getDuration(id) {
        let sound = this.sounds[id];
        if (sound) {
            return sound.getDuration();
        }
        return 0;
    }

    getPosition(id) {
        let sound = this.sounds[id];
        if (sound) {
            return sound.getPosition();
        }
        return 0;
    }

    toggleLoop() {
        this.options.loop = !this.options.loop;
    }

    isPlaying() {
        for (let id in this.sounds) {
            if (this.sounds.hasOwnProperty(id) && this.sounds[id].playing) return true;
        }

        return false;
    }

    isLooping() {
        return this.options.loop;
    }
}

module.exports = Player;