import EventEmitter from 'core/EventEmitter';

const UPDATE_INTERVAL = 200;

export default class Player extends EventEmitter {
    constructor(context) {
        super();

        this.audioContext = context;
        this.nodes = [];
        this.sounds = {};

        this.volume = this.audioContext.createGain();
        this.volume.connect(this.audioContext.destination);

        this.loop = false;
    }

    load(id, sound) {
        this.unload(id);

        this.sounds[id] = sound;

        sound.addNode(this.volume);

        this.emit('load', id);
    }

    unload(id) {
        let sound = this.sounds[id];

        if (sound) {
            this.stop(id);
            sound.unload();

            this.emit('unload', id);
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
                            if (this.loop) {
                                this.seek(id, 0);
                            }
                            else {
                                this.stop(id);
                            }
                        }

                        this.emit('tick', id);
                    },
                    UPDATE_INTERVAL
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

    setLoop(val) {
        this.loop = val;
    }

    isPlaying() {
        for (let id in this.sounds) {
            if (this.sounds.hasOwnProperty(id) && this.sounds[id].playing) return true;
        }

        return false;
    }

    isLooping() {
        return this.loop;
    }
}