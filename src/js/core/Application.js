'use strict';

var _ = require('lodash');

var EventEmitter = require('../core/EventEmitter.js');
var Timer = require('../core/Timer.js');
var Player = require('../audio/Player.js');
var BufferedSound = require('../audio/BufferedSound.js');
var SpectrumAnalyzer = require('../audio/SpectrumAnalyzer.js');
var Stage = require('../display/Stage.js');
var Scene = require('../display/Scene.js');
var Display = require('../display/Display.js');
var DisplayLibrary = require('../display/DisplayLibrary.js');
var EffectsLibrary = require('../effects/EffectsLibrary.js');
var VideoRenderer = require('../video/VideoRenderer.js');
var IO = require('../IO.js');

var VERSION = '1.0';

var defaults = {
    fps: 29.97,
    canvasWidth: 854,
    canvasHeight: 480,
    useCompression: false
};

var Application = function() {
    this.requestId = null;

    this.audioContext = new window.AudioContext();
    this.audioFile = null;

    this.player = new Player(this.audioContext);
    this.stage = new Stage();
    this.timer = new Timer();
    this.options = _.assign({}, defaults);
    this.spectrum = new SpectrumAnalyzer(this.audioContext);

    this.player.on('play', this.updateAnalyzer.bind(this));
    this.player.on('stop', this.updateAnalyzer.bind(this));
};

Application.prototype = _.create(EventEmitter.prototype, {
    constructor: Application,

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

            reader.onerror = function() {
                reject(file.error);
            }.bind(this);

            timer.set('file_load');

            if (typeof file === 'string') {
                this.audioFile = file;
                file = IO.readFileAsBlob(file);
            }

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

    startRender: function() {
        if (!this.requestId) {
            this.render();
        }
    },

    stopRender: function() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    },

    getFrameData: function() {
        return {
            delta: 0,
            fft: this.spectrum.getFrequencyData(),
            td: this.spectrum.getTimeData(),
            playing: this.player.isPlaying()
        };
    },

    render: function(timestamp) {
        var now = performance.now(),
            id = window.requestAnimationFrame(this.render.bind(this, now)),
            data = this.getFrameData();

        data.delta = now - timestamp;

        this.stage.renderFrame(data);

        this.emit('render', data);

        this.requestId = id;
    },

    saveImage: function(filename) {
        var stage = this.stage,
            data = this.getFrameData();

        stage.renderFrame(data, function(){
            stage.getImage(function(buffer) {
                IO.fs.writeFile(filename, buffer, function(err) {
                    if (err) {
                        this.emit('error', new Error(err));
                    }

                    // DEBUG
                    console.log(filename + ' saved.');
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    saveVideo: function(filename) {
        var player = this.player,
            sound = player.getSound('audio'),
            renderer = new VideoRenderer(filename, this.audioFile, {
                fps: 29.97,
                frames: 29.97 * 5
            });

        if (sound) {
            this.stopRender();

            player.stop('audio');

            this.spectrum.enabled = true;

            renderer.renderVideo(
                this.renderFrame.bind(this),
                this.startRender.bind(this)
            );
        }
        else {
            this.emit('error', new Error('No audio loaded.'));
        }

        // DEBUG
        console.log(filename + ' saved');
    },

    renderFrame: function(frame, fps, callback) {
        var data, image,
            player = this.player,
            spectrum = this.spectrum,
            stage = this.stage,
            sound = player.getSound('audio'),
            source = this.source = this.audioContext.createBufferSource();

        source.buffer = sound.buffer;
        source.connect(spectrum.analyzer);

        source.onended = function() {
            data = this.getFrameData();
            data.delta = 1000 / fps;

            stage.renderFrame(data, function() {
                stage.getImage(function(buffer) {
                    image = buffer;
                });
            });

            source.disconnect();

            callback(frame + 1, image);
        }.bind(this);

        source.start(0, frame / fps, 1 / fps);
    },

    saveProject: function(filename) {
        var data, sceneData,
            options = this.options;

        sceneData = this.stage.getScenes().map(function(scene) {
            return scene.toJSON();
        });

        data = {
            version: VERSION,
            scenes: sceneData
        };

        if (options.useCompression) {
            IO.zlib.deflate(
                JSON.stringify(data),
                function(err, buf) {
                    IO.fs.writeFileSync(filename, new IO.Buffer(buf));
                }.bind(this)
            );
        }
        else {
            IO.fs.writeFile(filename, JSON.stringify(data));
        }

        // DEBUG
        console.log(filename + ' saved.');
    },

    loadProject: function(filename) {
        var options = this.options;

        var data = IO.fs.readFileSync(filename);

        if (options.useCompression) {
            IO.zlib.inflate(data, function(err, buf) {
                try {
                    this.loadControls(JSON.parse(buf.toString()));
                }
                catch (err) {
                    this.raiseError('Invalid project data.', err);
                }
            }.bind(this));
        }
        else {
            try {
                this.loadControls(JSON.parse(data));
            }
            catch (err) {
                this.raiseError('Invalid project data.', err);
            }
        }
    },

    loadControls: function(data) {
        var controls = _.assign({}, DisplayLibrary, EffectsLibrary);

        if (typeof data === 'object') {
            this.stage.clearScenes();

            data.scenes.forEach(function(item) {
                var scene = new Scene(item.name, item.options);
                this.stage.addScene(scene);

                if (item.displays) {
                    item.displays.forEach(function(display) {
                        scene.addElement(new controls[display.name](display.options));
                    }, this);
                }

                if (item.effects) {
                    item.effects.forEach(function(effect) {
                        scene.addElement(new controls[effect.name](effect.options));
                    }, this);
                }
            }.bind(this));

            this.emit('control_added');
        }
        else {
            this.raiseError('Invalid project data.');
        }
    },

    updateAnalyzer: function() {
        var player = this.player,
            spectrum = this.spectrum,
            sound = player.getSound('audio');

        if (sound) {
            spectrum.enabled = (sound.playing || sound.paused);
        }
    },

    raiseError: function(msg, e) {
        if (e) console.error(e);
        this.emit('error', new Error(msg));
    }
});

module.exports = new Application;
