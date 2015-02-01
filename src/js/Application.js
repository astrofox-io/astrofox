'use strict';

var EventEmitter = require('./core/EventEmitter.js');
var Timer = require('./core/Timer.js');

var Player = require('./audio/Player.js');
var BufferedSound = require('./audio/BufferedSound.js');
var SpectrumAnalyzer = require('./audio/SpectrumAnalyzer.js');
var RenderManager = require('./visual/RenderManager.js');

var BarDisplay = require('./visual/BarDisplay.js');
var ImageDisplay = require('./visual/ImageDisplay.js');
var TextDisplay = require('./visual/TextDisplay.js');

var defaults = {
    fps: 29.97
};

var Application = EventEmitter.extend({
    constructor: function() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext);
        this.player = new Player(this.audioContext);
        this.renderer = new RenderManager();
        this.timer = new Timer();
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
    this.renderer.setupCanvas(canvas);
};

Application.prototype.createAnalyzer = function(options) {
    return new SpectrumAnalyzer(this.audioContext, this.player.analyzer, options);
};

Application.prototype.FX = {
    BarDisplay: BarDisplay,
    ImageDisplay: ImageDisplay,
    TextDisplay: TextDisplay
};

module.exports = Application;