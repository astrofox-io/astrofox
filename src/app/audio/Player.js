import EventEmitter from 'core/EventEmitter';

const UPDATE_INTERVAL = 200;

export default class Player extends EventEmitter {
    constructor(context) {
        super();

        this.audioContext = context;
        this.nodes = [];
        this.audio = null;

        this.volume = this.audioContext.createGain();
        this.volume.connect(this.audioContext.destination);

        this.loop = false;
    }

    load(audio) {
        this.unload();

        this.audio = audio;

        audio.addNode(this.volume);

        this.emit('load');
    }

    unload() {
        let audio = this.audio;

        if (audio) {
            this.stop();
            audio.unload();

            this.emit('unload');
        }
    }

    play() {
        let audio = this.audio;

        if (audio) {
            if (audio.playing) {
                this.pause();
            }
            else {
                audio.play();

                this.timer = setInterval(
                    () => {
                        if (!audio.repeat && audio.getPosition() >= 1.0) {
                            if (this.loop) {
                                this.seek(0);
                            }
                            else {
                                this.stop();
                            }
                        }

                        this.emit('tick');
                    },
                    UPDATE_INTERVAL
                );

                this.emit('play');
            }
        }
    }

    pause() {
        let audio = this.audio;

        if (audio) {
            audio.pause();
            clearInterval(this.timer);
            this.emit('pause');
        }
    }

    stop() {
        let audio = this.audio;

        if (audio) {
            audio.stop();
            clearInterval(this.timer);
            this.emit('stop');
        }
    }

    seek(val) {
        let audio = this.audio;

        if (audio) {
            audio.seek(val);
            this.emit('seek');
        }
    }

    getAudio() {
        return this.audio;
    }

    setVolume(val) {
        if (this.volume) {
            this.volume.gain.value = val;
        }
    }

    getVolume() {
        return this.volume.gain.value;
    }

    getCurrentTime() {
        let audio = this.audio;

        if (audio) {
            return audio.getCurrentTime();
        }
        return 0;
    }

    getDuration() {
        let audio = this.audio;

        if (audio) {
            return audio.getDuration();
        }

        return 0;
    }

    getPosition() {
        let audio = this.audio;

        if (audio) {
            return audio.getPosition();
        }

        return 0;
    }

    setLoop(val) {
        this.loop = val;
    }

    isPlaying() {
        return this.audio && this.audio.playing;
    }

    isLooping() {
        return this.loop;
    }
}