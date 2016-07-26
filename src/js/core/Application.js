'use strict';

const id3 = require('id3js');
const { remote } = window.require('electron');
const { Menu } = remote;

const { Events } = require('./Global.js');
const Window = require('./Window.js');
const IO = require('./IO.js');
const EventEmitter = require('../core/EventEmitter.js');
const Logger = require('../core/Logger.js');
const Player = require('../audio/Player.js');
const BufferedSound = require('../audio/BufferedSound.js');
const SpectrumAnalyzer = require('../audio/SpectrumAnalyzer.js');
const Stage = require('../display/Stage.js');
const Scene = require('../display/Scene.js');
const Display = require('../display/Display.js');
const DisplayLibrary = require('../lib/DisplayLibrary.js');
const EffectsLibrary = require('../lib/EffectsLibrary.js');
const VideoRenderer = require('../video/VideoRenderer.js');

const appConfig = require('../../conf/app.json');
const menuConfig = require('../../conf/menu.json');

const VERSION = '1.0';
const APP_CONFIG_FILE = './app.config';
const FPS_POLL_INTERVAL = 500;

class Application extends EventEmitter {
    constructor() {
        super();
    
        this.audioContext = new window.AudioContext();
        this.audioFile = null;
    
        this.player = new Player(this.audioContext);
        this.stage = new Stage();
        this.spectrum = new SpectrumAnalyzer(this.audioContext);
    
        this.player.on('play', this.updateAnalyzer.bind(this));
        this.player.on('stop', this.updateAnalyzer.bind(this));

        this.config = Object.assign({}, appConfig);
    
        this.frameData = {
            id: 0,
            time: 0,
            delta: 0,
            fft: null,
            td: null,
            playing: false
        };
    
        this.stats = {
            fps: 0,
            ms: 0,
            time: 0,
            frames: 0,
            stack: new Uint8Array(10)
        };
    }

    init() {
        // Load config file
        this.loadConfig();

        // Create menu for OSX
        if (process.platform === 'darwin') {
            menuConfig.forEach(root => {
                if (root.submenu) {
                    root.submenu.forEach(item => {
                        if (!item.role) {
                            let action = `${root.label} / ${item.label}`;
                            item.click = this.menuAction.bind(this, action);
                        }
                    }, this);
                }
            }, this);

            const menu = Menu.buildFromTemplate(menuConfig);

            Menu.setApplicationMenu(menu);
        }
        
        // Default setup
        let scene = this.stage.addScene();

        scene.addElement(new DisplayLibrary.ImageDisplay());
        scene.addElement(new DisplayLibrary.BarSpectrumDisplay());
        scene.addElement(new DisplayLibrary.TextDisplay());

        Events.emit('layers_update');
        
        // Start rendering
        this.startRender();
    }

    menuAction(action, menuItem, browserWindow, event) {
        Events.emit('menu_action', action, !menuItem.checked);
    }

    loadConfig() {
        if (!IO.fileExists(APP_CONFIG_FILE)) {
            this.saveConfig(this.config);
        }
        else {
            IO.readFileCompressed(APP_CONFIG_FILE).then(data => {
                let config = JSON.parse(data);

                Logger.log('Config file loaded.', config);

                this.config = Object.assign({}, appConfig, config);
            });
        }
    }

    saveConfig(config, callback) {
        let data = JSON.stringify(config);

        IO.writeFileCompressed(APP_CONFIG_FILE, data).then(() => {
            Logger.log('Config file saved.', config);

            if (callback) callback();
        })
        .catch(error => {
            this.raiseError('Failed to save config file.', error);
        });
    }

    loadAudioFile(file) {
        Events.emit('audio_file_loading');

        this.player.stop('audio');

        return IO.readFileAsArrayBuffer(file)
            .then(data => {
                return this.loadAudioData(data);
            })
            .then(() => {
                Events.emit('audio_file_loaded');

                return this.loadAudioTags(file)
            })
            .catch(error => {
                this.raiseError('Failed to load audio file.', error);
            });
    }

    loadAudioData(data) {
        return new Promise((resolve, reject) => {
            let player = this.player,
                spectrum = this.spectrum,
                sound = new BufferedSound(this.audioContext);

            Logger.timeStart('audio_data_load');

            sound.on('load', () => {
                Logger.timeEnd('audio_data_load', 'Audio data loaded.');

                player.load('audio', sound, () => {
                    sound.addNode(spectrum.analyzer);
                });

                player.play('audio');

                resolve();
            }, this);

            sound.on('error', error => {
                reject(error);
            });

            sound.load(data);
        });
    }

    loadAudioTags(file) {
        return new Promise((resolve, reject) => {
            let data = IO.readFileAsBlob(file);

            id3({ file: data, type: id3.OPEN_FILE }, (err, tags) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(tags);
                }
            });
        });
    }

    startRender() {
        if (!this.frameData.id) {
            this.render();
        }
    }

    stopRender() {
        let id = this.frameData.id;
        if (id) {
            cancelAnimationFrame(id);
            this.frameData.id = null;
        }
    }

    getFrameData() {
        let data = this.frameData;

        data.fft = this.spectrum.getFrequencyData();
        data.td = this.spectrum.getTimeData();
        data.playing = this.player.isPlaying();

        return data;
    }

    updateFPS(now) {
        let stats = this.stats;

        if (!stats.time) {
            stats.time = now;
        }

        stats.frames += 1;

        if (now > stats.time + FPS_POLL_INTERVAL) {
            stats.fps = Math.round((stats.frames * 1000) / (now - stats.time));
            stats.ms = (now - stats.time) / stats.frames;
            stats.time = now;
            stats.frames = 0;
            stats.stack.copyWithin(1, 0);
            stats.stack[0] = stats.fps;

            Events.emit('tick', stats);
        }
    }

    render() {
        let now = window.performance.now(),
            data = this.getFrameData(),
            id = window.requestAnimationFrame(this.render.bind(this));

        data.delta = now - data.time;
        data.time = now;
        data.id = id;

        this.stage.renderFrame(data);

        Events.emit('render', data);

        this.updateFPS(now);
    }

    saveImage(filename) {
        let stage = this.stage,
            data = this.getFrameData();

        stage.renderFrame(data, () => {
            stage.getImage(buffer => {
                IO.writeFile(filename, buffer)
                    .catch(error => {
                        this.raiseError('Failed to save image file.', error);
                    })
                    .then(() => {
                        Logger.log('Image saved. (%s)', filename);
                    });
            });
        });
    }

    saveVideo(filename) {
        let player = this.player,
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
            Events.emit('error', new Error('No audio loaded.'));
        }

        Logger.log('Video saved. (%s)', filename);
    }

    renderFrame(frame, fps, callback) {
        let data, image,
            player = this.player,
            spectrum = this.spectrum,
            stage = this.stage,
            sound = player.getSound('audio'),
            source = this.source = this.audioContext.createBufferSource();

        source.buffer = sound.buffer;
        source.connect(spectrum.analyzer);

        source.onended = () => {
            data = this.getFrameData();
            data.delta = 1000 / fps;

            stage.renderFrame(data, () => {
                stage.getImage(buffer => {
                    image = buffer;
                });
            });

            source.disconnect();

            callback(frame + 1, image);
        };

        source.start(0, frame / fps, 1 / fps);
    }

    saveProject(file) {
        let data, sceneData;

        sceneData = this.stage.getScenes().map(scene => {
            return scene.toJSON();
        });

        data = JSON.stringify({
            version: VERSION,
            scenes: sceneData
        });

        IO.writeFileCompressed(file, data).then(() => {
            Logger.log('Project saved. (%s)', file);
        })
        .catch(error => {
            this.raiseError('Failed to save project file.', error);
        });
    }

    loadProject(file) {
        IO.readFileCompressed(file).then(
            data => {
                this.loadControls(JSON.parse(data));
            },
            error => {
                if (error.message.indexOf('incorrect header check') > -1) {
                    IO.readFile(file).then(data => {
                        this.loadControls(JSON.parse(data));
                    });
                }
                else {
                    throw error;
                }
            }
        )
        .catch(error => {
            this.raiseError('Failed to open project file.', error);
        });
    }

    loadControls(data) {
        let component;

        if (typeof data === 'object') {
            this.stage.clearScenes();

            data.scenes.forEach(item => {
                let scene = new Scene(item.name, item.options);
                this.stage.addScene(scene);

                if (item.displays) {
                    item.displays.forEach(display => {
                        component = DisplayLibrary[display.name];
                        if (component) {
                            scene.addElement(new component(display.options));
                        }
                        else {
                            Logger.warn('Display %s not found.', display.name);
                        }
                    }, this);
                }

                if (item.effects) {
                    item.effects.forEach(effect => {
                        component = EffectsLibrary[effect.name];
                        if (component) {
                            scene.addElement(new component(effect.options));
                        }
                        else {
                            Logger.warn('Effect %s not found.', effect.name);
                        }
                    }, this);
                }
            });

            Events.emit('layers_update');
        }
        else {
            this.raiseError('Invalid project data.');
        }
    }

    updateAnalyzer() {
        let player = this.player,
            spectrum = this.spectrum,
            sound = player.getSound('audio');

        if (sound) {
            spectrum.clearFrequencyData();
            spectrum.clearTimeData();
            spectrum.enabled = (sound.playing || sound.paused);
        }
    }

    raiseError(msg, err) {
        if (err) {
            Logger.error(err);
        }

        Events.emit('error', new Error(msg));
    }
}

module.exports = new Application();
