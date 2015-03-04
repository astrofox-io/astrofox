'use strict';

var EventEmitter = require('./core/EventEmitter.js');
var Timer = require('./core/Timer.js');

var Player = require('./audio/Player.js');
var BufferedSound = require('./audio/BufferedSound.js');
var SpectrumAnalyzer = require('./audio/SpectrumAnalyzer.js');
var WaveformAnalyzer = require('./audio/WaveformAnalyzer.js');
var Scene = require('./visual/Scene.js');

var BarDisplay = require('./visual/BarDisplay.js');
var ImageDisplay = require('./visual/ImageDisplay.js');
var TextDisplay = require('./visual/TextDisplay.js');

var _ = require('lodash');

var defaults = {
    fps: 29.97,
    canvasHeight: 480,
    canvasWidth: 854,
    useGzip: true
};

var Application = EventEmitter.extend({
    constructor: function() {
        this.frame = null;
        this.controls = [];

        this.audioContext = new (window.AudioContext || window.webkitAudioContext);
        this.player = new Player(this.audioContext);
        this.sound = new BufferedSound(this.audioContext);
        this.scene = new Scene();
        this.timer = new Timer();
        this.reader = new FileReader();
        this.options = _.assign({}, defaults);

        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 2048;
        this.analyzer.minDecibels = -100;
        this.analyzer.maxDecibels = 0;
        this.analyzer.smoothingTimeConstant = 0;

        this.waveform = new WaveformAnalyzer(this.audioContext);

        this.FX = {
            BarDisplay: BarDisplay,
            ImageDisplay: ImageDisplay,
            TextDisplay: TextDisplay
        };
    }
});

Application.prototype.loadAudioFile = function(file, callback) {
    var reader = this.reader,
        player = this.player,
        timer = this.timer;

    player.stop('audio');

    reader.onload = function(e) {
        // DEBUG
        console.log('file loaded', timer.get('file_load'));
        var data = e.target.result;

        if (callback) {
            callback(file.error, data);
        }
    }.bind(this);

    timer.set('file_load');
    reader.readAsArrayBuffer(file);
};

Application.prototype.loadAudioData = function(data, callback) {
    var player = this.player,
        analyzer = this.analyzer,
        waveform = this.waveform,
        timer = this.timer,
        sound = new BufferedSound(this.audioContext);

    sound.on('load', function() {
        // DEBUG
        console.log('sound loaded', timer.get('sound_load'));

        player.load('audio', sound, function() {
            sound.connect(analyzer);
            waveform.loadBuffer(sound.buffer);
        });

        player.play('audio');

        if (callback) callback();
    }.bind(this));

    if (callback) {
        sound.on('error', function(error) {
            callback(error);
        });
    }

    timer.set('sound_load');
    sound.load(data);
};

Application.prototype.loadCanvas = function(canvas) {
    this.scene.setupCanvas(canvas);
};

Application.prototype.createAnalyzer = function(options) {
    return new SpectrumAnalyzer(this.audioContext, this.analyzer, options);
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

Application.prototype.startRender = function() {
    if (!this.frame) {
        this.renderScene();
    }
};

Application.prototype.stopRender = function() {
    if (this.frame) {
        window.cancelAnimationFrame(this.frame);
        this.frame = null;
    }
};

Application.prototype.renderScene = function() {
    this.renderFrame(this.frame);

    this.frame = window.requestAnimationFrame(this.renderScene.bind(this));
};

Application.prototype.renderFrame = function(frame, data, callback) {
    var scene = this.scene,
        analyzer = this.analyzer,
        fft = new Float32Array(analyzer.frequencyBinCount);

    analyzer.getFloatFrequencyData(fft);

    scene.clear();

    _(this.controls).forEachRight(function(control) {
        if (control.renderToCanvas) {
            control.renderToCanvas(
                (control.context === '3d') ? scene.context3d : scene.context2d,
                frame,
                fft
            );
        }
    }.bind(this));

    scene.render();

    if (callback) callback();
};

Application.prototype.processFrame = function(frame, fps, callback) {
    var player = this.player,
        analyzer = this.analyzer,
        sound = player.getSound('audio'),
        source = this.source = this.audioContext.createBufferSource();

    source.buffer = sound.buffer;
    source.connect(analyzer);

    source.onended = function() {
        var fft = new Float32Array(analyzer.frequencyBinCount);

        analyzer.getFloatFrequencyData(fft);

        this.renderFrame(frame, fft);

        source.disconnect();

        if (callback) callback(frame+1);
    }.bind(this);

    source.start(0, frame/fps, 1/fps);
};

Application.prototype.saveImage = function(file) {
    this.scene.renderImage(function(buffer) {
        Node.FS.writeFile(file, buffer);

        // DEBUG
        console.log(file + ' saved');
    });
};

Application.prototype.saveVideo = function(file) {
    var player = this.player,
        scene = this.scene,
        sound = player.getSound('audio');

    this.stopRender();

    if (player.isPlaying()) player.stop('audio');

    if (sound) {
        //scene.renderVideo(file, this.options.fps, 5, this.getFFT.bind(this));
        scene.renderVideo(file, 29.97, 5, this.processFrame.bind(this), function(){
            this.startRender();
        }.bind(this));
    }

    // DEBUG
    console.log(file + ' saved');
};

Application.prototype.saveProject = function(file) {
    var data, buffer,
        options = this.options,
        fs = Node.FS,
        Buffer = Node.Buffer,
        zlib = Node.Zlib;

    data = this.controls.map(function(control) {
        return control.getConfiguration();
    });

    if (options.useGzip) {
        data = JSON.stringify(data);

        zlib.deflate(data, function(err, buf) {
            buffer = new Buffer(buf);
            fs.writeFileSync(file, buffer);
        }.bind(this));
    }
    else {
        fs.writeFile(file, JSON.stringify(data));
    }

    // DEBUG
    console.log(file + ' saved');
};

Application.prototype.loadProject = function(file) {
    var data,
        options = this.options,
        reader = this.reader,
        fs = Node.FS,
        zlib = Node.Zlib;

    if (options.useGzip) {
        data = fs.readFileSync(file);
        zlib.inflate(data, function(err, buf) {
            this.loadControls(JSON.parse(buf.toString()));
        }.bind(this));
    }
    else {
        reader.onload = function(e) {
            data = JSON.parse(e.target.result);
            this.loadControls(data);
        }.bind(this);

        reader.readAsText(file);
    }
};

Application.prototype.loadControls = function(data) {
    var controls = this.controls;

    data.forEach(function (config) {
        controls.forEach(function (control) {
            if (config.name == control.name) {
                control.setState(config.values);
            }
        }.bind(this));
    }.bind(this));
};

// Supposedly 1.5x faster than Array.splice
function spliceOne(list, index) {
    for (var i = index, k = i+1, n = list.length; k < n; i += 1, k += 1) {
        list[i] = list[k];
    }
    list.pop();
}

module.exports = Application;