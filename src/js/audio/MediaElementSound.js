'use strict';

const Sound = require('./Sound.js');

class MediaElementSound extends Sound {
    constructor(context) {
        super(context);
    }

    load(audio) {
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
    }

    getDuration() {
        return this.source.duration || 0;
    }

    getCurrentTime() {
        return this.source.currentTime || 0;
    }

    play() {
        this.audio.play();
        this.playing = true;
        this.paused = false;

        this.emit('play');
    }

    pause() {
        this.audio.pause();
        this.playing = false;
        this.paused = true;

        this.emit('pause');
    }

    stop() {
        this.audio.pause();
        this.playing = false;
        this.paused = false;

        this.emit('stop');
    }
}

module.exports = MediaElementSound;