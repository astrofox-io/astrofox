'use strict';

const Sound = require('../audio/Sound.js');

class BufferedSound extends Sound {
    constructor(context) {
        super(context);

        this.startTime = 0;
        this.stopTime = 0;
    }

    load(src) {
        if (typeof src === 'string') {
            this.loadUrl(src);
        }
        else if (src instanceof ArrayBuffer) {
            this.loadData(src);
        }
        else if (src instanceof AudioBuffer) {
            this.loadBuffer(src);
        }
        else {
            alert('Invalid source: ' + (typeof src));
            this.emit('error');
        }
    }

    unload(callback) {
        if (this.source) {
            this.stop();
            this.source = null;
            this.buffer = null;
            this.off();
        }

        if (callback) callback();
    }

    // Loads a url via AJAX
    loadUrl(src) {
        let request = new XMLHttpRequest();

        this.src = src;

        request.open('GET', this.src, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            this.loadData(request.response);
        };

        request.send();
    }

    // Decodes an ArrayBuffer into an AudioBuffer
    loadData(data) {
        this.audioContext.decodeAudioData(
            data,
            (buffer) => {
                this.loadBuffer(buffer);
            },
            (e) => {
                this.emit('error', new Error('Invalid audio file.'));
            }
        );
    }

    // Loads an AudioBuffer
    loadBuffer(buffer) {
        this.buffer = buffer;
        this.initBuffer();
        this.loaded = true;
        this.emit('load');
    }

    initBuffer() {
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.buffer;

        this.nodes.forEach((node) => {
            this.source.connect(node);
        }, this);
    }

    play() {
        if (!this.loaded) return;

        this.initBuffer();

        this.startTime = this.audioContext.currentTime;
        this.source.start(0, this.getCurrentTime());
        this.playing = true;
        this.paused = false;

        this.emit('play');
    }

    pause() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }

        this.stopTime += this.audioContext.currentTime - this.startTime;
        this.playing = false;
        this.paused = true;

        this.emit('pause');
    }

    stop() {
        if (this.source) {
            this.source.stop();
            this.source.disconnect();
            this.source = null;
        }

        this.stopTime = 0;
        this.playing = false;
        this.paused = false;

        this.emit('stop');
    }

    seek(pos) {
        if (this.playing) {
            this.stop();
            this.updatePosition(pos);
            this.play();
        }
        else {
            this.updatePosition(pos);
        }

        this.emit('seek');
    }

    getCurrentTime() {
        if (this.playing) {
            return this.stopTime + (this.audioContext.currentTime - this.startTime);
        }
        else {
            return this.stopTime;
        }
    }

    getDuration() {
        return (this.buffer) ? this.buffer.duration : 0;
    }

    updatePosition(pos) {
        this.stopTime = ~~(pos * this.buffer.duration);
    }
}

module.exports = BufferedSound;