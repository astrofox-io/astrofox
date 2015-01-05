'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var SpectrumAnalyzer = require('./SpectrumAnalyzer.js');
var WaveformAnalyzer = require('./WaveformAnalyzer.js');
var _ = require('lodash');

var defaults = {
    updateInterval: 500
};

var Player = EventEmitter.extend({
    constructor: function(context, options) {
        this.nodes = [];
        this.sounds = {};

        this.audioContext = context;
        this.spectrum = new SpectrumAnalyzer(this.audioContext, this.audioContext.createAnalyser());
        this.waveform = new WaveformAnalyzer(this.audioContext);
        this.processor = this.audioContext.createScriptProcessor();
        this.volume = this.audioContext.createGain();
        this.volume.connect(this.audioContext.destination);

        this.processor.onaudioproces = this.processAudio;

        this.init(options);
    }
});

Player.prototype.init = function(options) {
    this.options = _.assign({}, defaults, options);
};

Player.prototype.connect = function(node) {
    if (this.nodes.indexOf(node) < 0) {
        this.nodes.push(node);
    }
    this.volume.connect(node);
};

Player.prototype.disconnect = function() {
    this.volume.disconnect();
};

Player.prototype.load = function(id, sound) {
    this.stop(id);
    this.sounds[id] = sound;

    sound.connect(this.volume);
    sound.connect(this.spectrum.analyzer);
    sound.connect(this.processor);

    // TODO: handle mediaelement as well
    if (sound.buffer) {
        this.waveform.loadBuffer(sound.buffer);
    }

    this.emit('load');
};

Player.prototype.process = function(buffer, callback) {
    var audioContext = new AudioContext();
    var analyzer = audioContext.createAnalyser();
    var processor = audioContext.createScriptProcessor(256, 1, 1);
    var fft = new Float32Array(128);
    var max = 0;

    analyzer.fftSize = 256;
    analyzer.minDecibels = -100;
    analyzer.maxDecibels = 0;
    analyzer.minFrequency = 0;
    analyzer.maxFrequency = audioContext.sampleRate / 2;

    for (var i = 0; i < buffer.duration; i++) {
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(analyzer);
        source.start(0, i);
        analyzer.getFloatFrequencyData(fft);
        for (var j = 0; j < fft.length; j++) {
            var val = Math.exp(0.1151292546497023 * fft[j]);
            if (val > max) max = val;
        }
        console.log(max);
        source.stop();
    };

    if (callback) callback(max);
};

Player.prototype.processAudio = function(e) {
    var i,
        buffer = e.inputBuffer.getChannelData(0),
        len = buffer.length;

    for (i = 0; i < len; i++) {

    }

    console.log('process');
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

                if (!sound.repeat && sound.getProgress(id) >= 1.0) {
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

Player.prototype.getProgress = function(id) {
    var sound = this.sounds[id];
    if (sound) {
        return sound.getProgress();
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