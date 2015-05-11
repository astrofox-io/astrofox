'use strict';

var Class = require('./core/Class.js');
var EventEmitter = require('./core/EventEmitter.js');
var Timer = require('./core/Timer.js');
var Player = require('./audio/Player.js');
var BufferedSound = require('./audio/BufferedSound.js');
var SpectrumAnalyzer = require('./audio/SpectrumAnalyzer.js');
var Scene = require('./display/Scene.js');
var FX = require('./FX.js');
var IO = require('./IO.js');
var _ = require('lodash');

var defaults = {
    fps: 29.97,
    canvasWidth: 854,
    canvasHeight: 480,
    useCompression: false
};

var Application = function() {
    this.frame = null;
    this.displays = [];

    this.audioContext = new (window.AudioContext || window.webkitAudioContext);
    this.player = new Player(this.audioContext);
    this.sound = new BufferedSound(this.audioContext);
    this.scene = new Scene();
    this.timer = new Timer();
    this.options = _.assign({}, defaults);
    this.spectrum = new SpectrumAnalyzer(this.audioContext);

    this.FX = FX;
};

Class.extend(Application, EventEmitter, {
    loadAudioFile: function(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader(),
                player = this.player,
                timer = this.timer;

            player.stop('audio');

            reader.onload = function(e) {
                // DEBUG
                console.log('file loaded', timer.get('file_load'));
                resolve(e.target.result);
            };

            reader.onerror = function(e) {
                reject(file.error);
            }.bind(this);

            timer.set('file_load');
            reader.readAsArrayBuffer(file);
        }.bind(this));
    },

    loadAudioData: function(data) {
        return new Promise(function(resolve, reject) {
            var player = this.player,
                spectrum = this.spectrum,
                timer = this.timer,
                sound = new BufferedSound(this.audioContext);

            sound.on('load', function() {
                // DEBUG
                console.log('sound loaded', timer.get('sound_load'));

                player.load('audio', sound, function() {
                    sound.connect(spectrum.analyzer);
                });

                player.play('audio');

                resolve();
            }.bind(this));

            sound.on('error', function(error) {
                reject(error);
            });

            timer.set('sound_load');
            sound.load(data);
        }.bind(this));
    },

    loadCanvas: function(canvas) {
        this.scene.setupCanvas(canvas);
    },

    addDisplay: function(display, index) {
        if (typeof index !== 'undefined') {
            this.displays.splice(index, 0, display);
        }
        else {
            this.displays.push(display);
        }
    },

    removeDisplay: function(display) {
        var index = this.displays.indexOf(display);
        if (index > -1) {
            this.displays.splice(index, 1);
        }
    },

    swapDisplay: function(index, newIndex) {
        var tmp,
            displays = this.displays;

        if (index > -1 && index < displays.length) {
            tmp = displays[index];
            displays[index] = displays[newIndex];
            displays[newIndex] = tmp;
        }
    },

    showFPS: function(val) {
        this.scene.options.showFPS = val;
    },

    startRender: function() {
        if (!this.frame) {
            this.renderScene();
        }
    },

    stopRender: function() {
        if (this.frame) {
            window.cancelAnimationFrame(this.frame);
            this.frame = null;
        }
    },

    renderScene: function() {
        this.renderFrame(this.frame);

        this.frame = window.requestAnimationFrame(this.renderScene.bind(this));
    },

    renderFrame: function(frame, data, callback) {
        var fft,
            scene = this.scene,
            spectrum = this.spectrum;

        fft = spectrum.getFrequencyData();

        scene.clear();

        _.forEachRight(this.displays, function(display) {
            if (display.renderToCanvas) {
                display.renderToCanvas(
                    (display.type === '3d') ? scene.context3d : scene.context2d,
                    frame,
                    fft
                );
            }
        }.bind(this));

        scene.render();

        if (callback) callback();
    },

    processFrame: function(frame, fps, callback) {
        var fft,
            player = this.player,
            spectrum = this.spectrum,
            sound = player.getSound('audio'),
            source = this.source = this.audioContext.createBufferSource();

        source.buffer = sound.buffer;
        source.connect(analyzer);

        source.onended = function() {
            fft = spectrum.getFrequencyData();

            this.renderFrame(frame, fft);

            source.disconnect();

            if (callback) callback(frame + 1);
        }.bind(this);

        source.start(0, frame / fps, 1 / fps);
    },

    saveImage: function(file) {
        this.scene.renderImage(function(buffer) {
            IO.fs.writeFile(file.path, buffer);

            // DEBUG
            console.log(file.path + ' saved');
        });
    },

    saveVideo: function(file) {
        var player = this.player,
            scene = this.scene,
            sound = player.getSound('audio');

        this.stopRender();

        if (player.isPlaying()) player.stop('audio');

        if (sound) {
            scene.renderVideo(file.path, 29.97, 5, this.processFrame.bind(this), function() {
                this.startRender();
            }.bind(this));
        }

        // DEBUG
        console.log(file + ' saved');
    },

    saveProject: function(file) {
        var data, buffer,
            options = this.options;

        data = this.displays.map(function(display) {
            return display.toJSON();
        });

        if (options.useCompression) {
            IO.zlib.deflate(
                JSON.stringify(data),
                function(err, buf) {
                    buffer = new IO.Buffer(buf);
                    IO.fs.writeFileSync(file.path, buffer);
                }.bind(this)
            );
        }
        else {
            IO.fs.writeFile(file.path, JSON.stringify(data));
        }

        // DEBUG
        console.log(file.path + ' saved');
    },

    loadProject: function(file) {
        var options = this.options;

        var data = IO.fs.readFileSync(file.path);

        if (options.useCompression) {
            IO.zlib.inflate(data, function(err, buf) {
                try {
                    this.loadControls(JSON.parse(buf.toString()));
                }
                catch (err) {
                    alert(err);
                    this.emit('error', new Error('Invalid project file.'));
                }
            }.bind(this));
        }
        else {
            try {
                this.loadControls(JSON.parse(data));
            }
            catch (err) {
                this.emit('error', new Error('Invalid project file.'));
            }
        }
    },

    loadControls: function(data) {
        if (data instanceof Array) {
            this.displays = [];

            data.forEach(function(item) {
                this.addDisplay(new FX[item.name](null, item.values));
            }.bind(this));

            this.emit('displays_updated');
        }
        else {
            this.emit('error', new Error('Invalid project file.'));
        }
    }
});

module.exports = new Application;