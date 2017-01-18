import Sound from '../audio/Sound';

export default class BufferedSound extends Sound {
    constructor(context) {
        super(context);

        this.source = null;
        this.startTime = 0;
        this.stopTime = 0;
    }

    load(src) {
        if (typeof src === 'string') {
            Promise.resolve(this.loadUrl(src));
        }
        else if (src instanceof ArrayBuffer) {
            Promise.resolve(this.loadData(src));
        }
        else if (src instanceof AudioBuffer) {
            Promise.resolve(this.loadBuffer(src));
        }
        else {
            Promise.reject('Invalid source: ' + (typeof src));
        }
    }

    unload() {
        if (this.source) {
            this.stop();
            this.source = null;
            this.buffer = null;
            this.off();
        }
    }

    // Loads a url via AJAX
    loadUrl(src) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            request.open('GET', src);
            request.responseType = 'arraybuffer';

            request.onload = () => {
                resolve(request.response);
            };

            request.onerror = () => {
                reject();
            };

            request.send();
        }).then(response => {
            this.loadData(response);
        });
    }

    // Decodes an ArrayBuffer into an AudioBuffer
    loadData(data) {
        return this.audioContext.decodeAudioData(data)
            .then(buffer => {
                this.loadBuffer(buffer);
            })
            .catch(error => {
                this.emit('error', 'Invalid audio file: ' + error.message);
            });
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

        this.nodes.forEach(node => {
            this.source.connect(node);
        });
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
            if (this.playing) this.source.stop();
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

    getPosition() {
        return (this.getCurrentTime() / this.getDuration()) || 0;
    }

    updatePosition(pos) {
        this.stopTime = ~~(pos * this.buffer.duration);
    }
}