'use strict';

const id3 = require('id3js');
const { remote } = window.require('electron');
const { Menu } = remote;

const { Events, Logger } = require('./Global');
const IO = require('./IO');
const EventEmitter = require('../core/EventEmitter');
const Player = require('../audio/Player');
const BufferedSound = require('../audio/BufferedSound');
const SpectrumAnalyzer = require('../audio/SpectrumAnalyzer');
const Stage = require('../displays/Stage');
const Scene = require('../displays/Scene');
const Display = require('../displays/Display');
const DisplayLibrary = require('../lib/DisplayLibrary');
const EffectsLibrary = require('../lib/EffectsLibrary');
const VideoRenderer = require('../video/VideoRenderer');

const appConfig = require('../../conf/app.json');
const menuConfig = require('../../conf/menu.json');

const APP_NAME = 'Astrofox';
const VERSION = '1.0';
const APP_CONFIG_FILE = './app.config';
const FPS_POLL_INTERVAL = 500;
const DEFAULT_PROJECT = IO.resolve(__dirname, 'resources/projects/default.afx');

class Application extends EventEmitter {
    constructor() {
        super();
    
        this.audioContext = new window.AudioContext();
        this.player = new Player(this.audioContext);
        this.stage = new Stage();
        this.spectrum = new SpectrumAnalyzer(this.audioContext);
        this.audioFile = '';
        this.projectFile = '';
        this.rendering = false;
        this.bufferSource = null;
        this.menu = null;

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

        // Player events
        this.player.on('play', this.updateAnalyzer, this);
        this.player.on('pause', this.updateAnalyzer, this);
        this.player.on('stop', this.updateAnalyzer, this);

        // Default configuration
        this.config = Object.assign({}, appConfig);
    }

    init() {
        Logger.log(APP_NAME, 'version', VERSION, __dirname);

        // Load config file
        this.loadConfig();

        // Create menu
        menuConfig.forEach(root => {
            if (root.submenu) {
                root.submenu.forEach(item => {
                    if (!item.role && item.action) {
                        item.click = this.menuAction;
                    }
                });
            }
        });

        this.menu = Menu.buildFromTemplate(menuConfig);

        // Create menu for OSX
        if (process.platform === 'darwin') {
            Menu.setApplicationMenu(this.menu);
        }

        // Window events
        window.onmousedown = (e) => {
            Events.emit('mousedown', e);
        };

        window.onmouseup = (e) => {
            Events.emit('mouseup', e);
        };

        // Handle uncaught errors
        window.onerror = (msg, src, line, col, err) => {
            this.raiseError(msg, err);
            return true;
        };

        // Default project
        this.newProject();
    }

    startRender() {
        if (!this.frameData.id) {
            this.render();
            this.rendering = true;
        }
    }

    stopRender() {
        let id = this.frameData.id;

        if (id) {
            window.cancelAnimationFrame(id);
        }

        this.frameData.id = 0;
        this.rendering = false;
    }

    render() {
        let now = window.performance.now(),
            data = this.getFrameData(),
            id = window.requestAnimationFrame(this.render.bind(this));

        data.delta = now - data.time;
        data.time = now;
        data.id = id;

        this.stage.render(data);

        Events.emit('render', data);

        this.updateFPS(now);
    }

    renderFrame(frame, fps, callback) {
        let data, image,
            player = this.player,
            spectrum = this.spectrum,
            stage = this.stage,
            sound = player.getSound('audio'),
            source = this.bufferSource = this.audioContext.createBufferSource();

        source.buffer = sound.buffer;
        source.connect(spectrum.analyzer);

        source.onended = () => {
            data = this.getFrameData(true);
            data.delta = 1000 / fps;

            stage.render(data, () => {
                stage.getImage(buffer => {
                    image = buffer;
                });
            });

            source.disconnect();

            callback(image);
        };

        source.start(0, frame / fps, 1 / fps);
    }

    loadConfig() {
        if (IO.fileExists(APP_CONFIG_FILE)) {
            return IO.readFileCompressed(APP_CONFIG_FILE).then(data => {
                let config = JSON.parse(data);

                Logger.log('Config file loaded.', config);

                this.config = Object.assign({}, appConfig, config);
            });
        }
        else {
            this.saveConfig(this.config);
        }
    }

    loadAudioFile(file) {
        this.player.stop('audio');

        return IO.readFileAsBlob(file)
            .then(blob => {
                return IO.readAsArrayBuffer(blob);
            })
            .then(data => {
                return this.loadAudioData(data);
            })
            .then(() => {
                this.audioFile = file;
                this.loadAudioTags(file);

                return file;
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

                player.load('audio', sound);

                sound.addNode(spectrum.analyzer);

                resolve();
            }, this);

            sound.on('error', error => {
                reject(error);
            });

            sound.load(data);
        });
    }

    loadAudioTags(file) {
        return IO.readFileAsBlob(file).then(data => {
            id3({ file: data, type: id3.OPEN_FILE }, (err, tags) => {
                if (!err) {
                    Events.emit('audio_tags', tags);
                }
            });
        });
    }

    loadProject(file) {
        return IO.readFileCompressed(file).then(
            data => {
                this.loadControls(JSON.parse(data));
                this.resetChanges();

                this.projectFile = file;

                Events.emit('project_loaded');
            },
            error => {
                if (error.message.indexOf('incorrect header check') > -1) {
                    IO.readFile(file).then(data => {
                        this.loadControls(JSON.parse(data));
                        this.resetChanges();

                        this.projectFile = file;

                        Events.emit('project_loaded');
                    })
                    .catch(error => {
                        this.raiseError('Invalid project file.', error);
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
                let scene = new Scene(item.options);
                this.stage.addScene(scene);

                if (item.displays) {
                    item.displays.forEach(display => {
                        component = DisplayLibrary[display.name];
                        if (!component) component = DisplayLibrary[display.name + 'Display'];

                        if (component) {
                            scene.addElement(new component(display.options));
                        }
                        else {
                            Logger.warn('Display "%s" not found.', display.name);
                        }
                    });
                }

                if (item.effects) {
                    item.effects.forEach(effect => {
                        component = EffectsLibrary[effect.name];
                        if (!component) component = EffectsLibrary[effect.name + 'Effect'];

                        if (component) {
                            scene.addElement(new component(effect.options));
                        }
                        else {
                            Logger.warn('Effect "%s" not found.', effect.name);
                        }
                    });
                }
            });

            if (data.stage) {
                this.stage.update(data.stage.options);
            }
            else {
                this.stage.update(Stage.defaults);
            }
        }
        else {
            this.raiseError('Invalid project data.');
        }
    }

    saveConfig(config, callback) {
        let data = JSON.stringify(config);

        return IO.writeFileCompressed(APP_CONFIG_FILE, data).then(() => {
            Logger.log('Config file saved.', config);

            Object.assign(this.config, config);

            if (callback) callback();
        })
        .catch(error => {
            this.raiseError('Failed to save config file.', error);
        });
    }

    saveImage(filename) {
        let stage = this.stage,
            data = this.getFrameData(true);

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

    saveVideo(filename, options, callback) {
        let player = this.player,
            sound = player.getSound('audio');

        options.command = this.config.ffmpegPath;

        if (sound) {
            let renderer = this.renderer = new VideoRenderer(filename, this.audioFile, options);

            // Setup before rendering
            this.stopRender();
            player.stop('audio');

            // Handle events
            renderer.on('ready', () => {
                this.renderFrame(renderer.currentFrame, options.fps, image => {
                    renderer.processFrame(image);
                });
            });

            renderer.on('complete', () => {
                Logger.log('Render complete.');

                if (callback) callback();

                this.bufferSource = null;
                player.stop('audio');
                this.startRender();
            });

            // Start render
            renderer.start();
        }
        else {
            this.raiseError('No audio loaded.');
        }

        Logger.log('Video saved. (%s)', filename);
    }

    saveProject(file) {
        let data, sceneData;

        sceneData = this.stage.getScenes().map(scene => {
            return scene.toJSON();
        });

        data = JSON.stringify({
            version: VERSION,
            stage: this.stage.toJSON(),
            scenes: sceneData
        });

        return IO.writeFileCompressed(file, data).then(() => {
            Logger.log('Project saved. (%s)', file);

            this.resetChanges();

            this.projectFile = file;
        })
        .catch(error => {
            this.raiseError('Failed to save project file.', error);
        });
    }

    newProject() {
        if (this.stage.hasChanges()) {
            Events.emit('unsaved_changes', () => {
                this.loadProject(DEFAULT_PROJECT).then(() => {
                    this.projectFile = '';
                });
            });
        }
        else {
            this.loadProject(DEFAULT_PROJECT).then(() => {
                this.projectFile = '';
            });
        }
    }

    getFrameData(forceUpdate) {
        let data = this.frameData,
            update = !!forceUpdate || this.player.isPlaying();

        data.fft = this.spectrum.getFrequencyData(update);
        data.td = this.spectrum.getTimeData(update);
        data.hasUpdate = update;

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

    updateAnalyzer() {
        let spectrum = this.spectrum,
            sound = this.player.getSound('audio');

        if (sound) {
            if (!sound.paused) {
                spectrum.clearFrequencyData();
                spectrum.clearTimeData();
            }
        }
    }

    menuAction(menuItem, browserWindow, event) {
        Events.emit('menu_action', menuItem.action);
    }

    resetChanges() {
        this.stage.resetChanges();
    }

    raiseError(message, error) {
        if (error) {
            Logger.error(message + "\n", error);
        }

        Events.emit('error', message);
    }

    isRendering() {
        return this.rendering;
    }

    hasAudio() {
        return !!this.player.getSound('audio');
    }
}

module.exports = new Application();
