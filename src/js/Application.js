'use strict';

var EventEmitter = require('./core/EventEmitter.js');
var Timer = require('./core/Timer.js');

var Player = require('./audio/Player.js');
var BufferedSound = require('./audio/BufferedSound.js');
var SpectrumAnalyzer = require('./audio/SpectrumAnalyzer.js');
var Scene = require('./visual/Scene.js');

var BarDisplay = require('./visual/BarDisplay.js');
var ImageDisplay = require('./visual/ImageDisplay.js');
var TextDisplay = require('./visual/TextDisplay.js');

var _ = require('lodash');

var defaults = {
    fps: 29.97
};

var Application = EventEmitter.extend({
    constructor: function() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext);
        this.player = new Player(this.audioContext);
        this.scene = new Scene();
        this.timer = new Timer();
        this.controls = [];
        this.options = _.assign({}, defaults);

        this.FX = {
            BarDisplay: BarDisplay,
            ImageDisplay: ImageDisplay,
            TextDisplay: TextDisplay
        };
    }
});

Application.prototype.loadAudio = function(data, callback, error) {
    var player = this.player,
        timer = this.timer,
        sound = new BufferedSound(this.audioContext);

    sound.on('load', function() {
        console.log('sound loaded', timer.get('sound_load'));

        player.load('audio', sound);
        player.play('audio');

        if (callback) callback();
    }.bind(this));

    if (error) {
        sound.on('error', error);
    }

    timer.set('sound_load');
    sound.load(data);
};

Application.prototype.loadCanvas = function(canvas) {
    this.scene.setupCanvas(canvas);
};

Application.prototype.createAnalyzer = function(options) {
    return new SpectrumAnalyzer(this.audioContext, this.player.analyzer, options);
};

Application.prototype.registerControl = function(control) {
    // DEBUG
    console.log('control registered', control.name);

    this.controls.push(control);
};

Application.prototype.unregisterControl = function(control) {
    // DEBUG
    console.log('control unregistered', control.name);

    var index = this.controls.indexOf(control);
    if (index > -1) {
        //this.controls.splice(index, 1);
        spliceOne(this.controls, index);
    }
};

Application.prototype.renderScene = function(callback, data) {
    var scene = this.scene,
        frame = performance.now();

    scene.clear();

    _(this.controls).forEachRight(function(control) {
        if (control.renderToCanvas) {
            control.renderToCanvas(
                (control.context === '3d') ? scene.canvas3d : scene.canvas2d,
                frame,
                data
            );
        }
    }.bind(this));

    scene.render();

    if (callback) callback();
};

Application.prototype.getFFT = function(start, fps, callback) {
    var player = this.player,
        sound = player.getSound('audio'),
        source = this.source = this.audioContext.createBufferSource();

    source.buffer = sound.buffer;
    source.connect(player.analyzer);

    source.onended = function() {
        var fft = new Float32Array(player.analyzer.frequencyBinCount);

        player.analyzer.getFloatFrequencyData(fft);
        source.disconnect();

        if (callback) callback(fft, start+1);
    }.bind(this);

    source.start(0, start/fps, 1/fps);
};

Application.prototype.saveImage = function(file) {
    this.scene.renderImage(function(buffer) {
        Node.FS.writeFile(file, buffer);
        console.log(file + ' saved');
    });
};

Application.prototype.saveVideo = function(file) {
    var player = this.player,
        scene = this.scene,
        sound = player.getSound('audio');

    if (player.isPlaying()) player.stop('audio');

    if (sound) {
        scene.renderVideo(file, 60, 5, this.getFFT.bind(this));
    }
};

// Supposedly 1.5x faster than Array.splice
function spliceOne(list, index) {
    for (var i = index, k = i+1, n = list.length; k < n; i += 1, k += 1) {
        list[i] = list[k];
    }
    list.pop();
}

module.exports = Application;