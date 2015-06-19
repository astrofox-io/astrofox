'use strict';

var _ = require('lodash');
var Immutable = require('immutable');

var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');
var Timer = require('core/Timer.js');
var Player = require('audio/Player.js');
var BufferedSound = require('audio/BufferedSound.js');
var SpectrumAnalyzer = require('audio/SpectrumAnalyzer.js');
var Stage = require('display/Stage.js');
var FX = require('FX.js');
var IO = require('IO.js');

var defaults = {
    fps: 29.97,
    canvasWidth: 854,
    canvasHeight: 480,
    useCompression: false
};

var Application = function() {
    this.frame = null;
    this.data = null;

    this.audioContext = new window.AudioContext();
    this.player = new Player(this.audioContext);
    this.sound = new BufferedSound(this.audioContext);
    this.stage = new Stage();
    this.timer = new Timer();
    this.options = _.assign({}, defaults);
    this.spectrum = new SpectrumAnalyzer(this.audioContext);

    this.player.on('play', this.updateAnalyzer.bind(this));
    this.player.on('stop', this.updateAnalyzer.bind(this));
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
                    sound.addNode(spectrum.analyzer);
                });

                player.play('audio');

                resolve();
            }, this);

            sound.on('error', function(error) {
                reject(error);
            });

            timer.set('sound_load');
            sound.load(data);
        }.bind(this));
    },

    loadCanvas: function(canvas) {
        this.stage.loadCanvas(canvas);
    },

    startRender: function() {
        if (!this.frame) {
            this.render();
        }
    },

    stopRender: function() {
        if (this.frame) {
            cancelAnimationFrame(this.frame);
            this.frame = null;
        }
    },

    render: function() {
        var fft = this.spectrum.getFrequencyData(),
            td = this.spectrum.getTimeData(),
            frame = window.requestAnimationFrame(this.render.bind(this)),
            data = {
                frame: frame,
                fft: fft,
                td: td
            };

        this.stage.renderFrame(data);

        this.emit('render', data);

        this.frame = frame;
        this.data = data;
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
        this.stage.renderImage(this.data, 'image/png', function(buffer) {
            IO.fs.writeFile(file.path, buffer);

            // DEBUG
            console.log(file.path + ' saved');
        });
    },

    saveVideo: function(file) {
        var player = this.player,
            stage = this.stage,
            sound = player.getSound('audio');

        this.stopRender();

        if (player.isPlaying()) player.stop('audio');

        if (sound) {
            stage.renderVideo(file.path, 29.97, 5, this.processFrame.bind(this), function() {
                this.startRender();
            }.bind(this));
        }

        // DEBUG
        console.log(file + ' saved');
    },

    saveProject: function(file) {
        var data, buffer,
            options = this.options;

        data = this.stage.scenes.map(function(scene) {
            return scene.toJSON();
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
            this.stage.scenes.clear();

            data.forEach(function(item) {
                this.stage.scenes.addScene(new FX[item.name](item.values));
            }.bind(this));

            this.emit('control_added');
        }
        else {
            this.emit('error', new Error('Invalid project file.'));
        }
    },

    updateAnalyzer: function() {
        var player = this.player,
            spectrum = this.spectrum,
            sound = player.getSound('audio');

        if (sound) {
            spectrum.enabled = (sound.playing || sound.paused);
        }
    }
});

module.exports = new Application;
