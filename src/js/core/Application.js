import id3 from 'id3js';
import { remote } from 'electron';

import { APP_VERSION, APP_CONFIG_FILE, DEFAULT_PROJECT } from './Environment';
import { events, logger, raiseError } from './Global';
import * as IO from '../util/io';
import AppUpdater from './AppUpdater';
import EventEmitter from './EventEmitter';
import LicenseManager from './LicenseManager';
import Player from '../audio/Player';
import BufferedSound from '../audio/BufferedSound';
import SpectrumAnalyzer from '../audio/SpectrumAnalyzer';
import Stage from '../displays/Stage';
import VideoRenderer from '../video/VideoRenderer';

import appConfig from '../../config/app.json';
import menuConfig from '../../config/menu.json';

const FPS_POLL_INTERVAL = 500;

export default class Application extends EventEmitter {
    constructor() {
        super();

        remote.getCurrentWindow().removeAllListeners();
    
        this.audioContext = new window.AudioContext();
        this.player = new Player(this.audioContext);
        this.spectrum = new SpectrumAnalyzer(this.audioContext);
        this.stage = new Stage(this);
        this.updater = new AppUpdater(this);
        this.license = new LicenseManager();

        this.audioFile = '';
        this.projectFile = '';
        this.rendering = false;

        // Default configuration
        this.config = Object.assign({}, appConfig);

        // Frame render data
        this.frameData = {
            id: 0,
            time: 0,
            delta: 0,
            fft: null,
            td: null,
            playing: false
        };

        // Rendering statistics
        this.stats = {
            fps: 0,
            ms: 0,
            time: 0,
            frames: 0,
            stack: new Uint8Array(10)
        };

        // App events
        this.on('config-updated', () => {
            this.showWatermark(this.config.showWatermark);
        });

        // Player events
        this.player.on('play', this.resetAnalyzer, this);
        this.player.on('pause', this.resetAnalyzer, this);
        this.player.on('stop', this.resetAnalyzer, this);

        // Window events
        window.onmousedown = (e) => {
            events.emit('mousedown', e);
        };

        window.onmouseup = (e) => {
            events.emit('mouseup', e);
        };

        // Handle uncaught errors
        window.onerror = (msg, src, line, col, err) => {
            raiseError(msg, err);
            return true;
        };

        // Bind context
        this.render = this.render.bind(this);
    }

    //region Main Methods
    init() {
        // Check for license
        this.license.load();

        // Load config file
        this.loadConfigFile()
            .then(() => {
                // Check for app updates
                if (this.config.checkForUpdates) {
                    this.updater.checkForUpdates();
                }
            });

        // Create app menu
        let menu = [];

        menuConfig.forEach(root => {
            if (__PROD__) {
                if (root.visible !== false) {
                    menu.push(root);
                }
            }
            else {
                menu.push(root);
            }

            if (root.submenu) {
                root.submenu.forEach(item => {
                    if (item.action && !item.role) {
                        item.click = this.doMenuAction;
                    }
                });
            }
        });

        remote.Menu.setApplicationMenu(
            remote.Menu.buildFromTemplate(menu)
        );

        // Load default project
        this.newProject();
    }

    doMenuAction(menuItem) {
        events.emit('menu-action', menuItem.action);
    }

    resetAnalyzer() {
        let spectrum = this.spectrum,
            audio = this.getAudio();

        if (audio && !audio.paused) {
            spectrum.clearFrequencyData();
            spectrum.clearTimeData();
        }
    }

    resetChanges() {
        this.stage.resetChanges();
    }

    isRendering() {
        return this.rendering;
    }
    //endregion

    //region Audio Methods
    getAudio() {
        return this.player.getSound('audio');
    }

    playAudio() {
        this.player.play('audio');
    }

    stopAudio() {
        this.player.stop('audio');
    }

    pauseAudio() {
        this.player.pause('audio');
    }

    seekAudio(pos) {
        this.player.seek('audio', pos);
    }

    getAudioPosition() {
        return this.player.getPosition('audio');
    }

    hasAudio() {
        return !!this.getAudio();
    }
    //endregion

    //region Render Methods
    startRender() {
        if (!this.rendering) {
            this.resetAnalyzer();
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
            data = this.getFrameData();

        data.id = window.requestAnimationFrame(this.render);
        data.delta = now - data.time;
        data.time = now;

        this.stage.render(data);

        events.emit('render', data);

        this.updateFPS(now);
    }

    renderFrame(frame, fps, callback) {
        let data, image,
            spectrum = this.spectrum,
            stage = this.stage,
            audio = this.getAudio(),
            source = this.audioContext.createBufferSource();

        source.buffer = audio.buffer;
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

    getFrameData(forceUpdate) {
        let data = this.frameData,
            update = forceUpdate || this.player.isPlaying();

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

            events.emit('tick', stats);
        }
    }

    showWatermark(show) {
        this.stage.watermarkDisplay.update({
            enabled: show
        });
    }
    //endregion

    //region Save/load Methods
    loadConfigFile() {
        if (IO.fileExists(APP_CONFIG_FILE)) {
            return IO.readFileCompressed(APP_CONFIG_FILE)
                .then(data => {
                    let config = JSON.parse(data);

                    logger.log('Config file loaded:', APP_CONFIG_FILE, config);

                    this.config = Object.assign({}, appConfig, config);

                    this.emit('config-updated');
                });
        }
        else {
            return this.saveConfigFile(this.config);
        }
    }

    loadAudioFile(file) {
        this.stopAudio();

        logger.time('audio-file-load');

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

                if (this.config.autoPlayAudio) {
                    this.playAudio();
                }

                logger.timeEnd('audio-file-load', 'Audio file loaded:', file);

                return file;
            })
            .catch(error => {
                raiseError('Failed to load audio file.', error);
            });
    }

    loadAudioData(data) {
        return new Promise((resolve, reject) => {
            let player = this.player,
                spectrum = this.spectrum,
                sound = new BufferedSound(this.audioContext);

            sound.on('load', () => {
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
        return IO.readFileAsBlob(file)
            .then(data => {
                id3({ file: data, type: id3.OPEN_FILE }, (err, tags) => {
                    if (!err) {
                        events.emit('audio-tags', tags);
                    }
                });
            });
    }

    loadProject(file) {
        return IO.readFileCompressed(file)
            .then(data => {
                this.stage.loadConfig(JSON.parse(data));
                this.resetChanges();

                this.projectFile = file;

                events.emit('project-loaded');
            },
            error => {
                if (error.message.indexOf('incorrect header check') > -1) {
                    IO.readFile(file).then(data => {
                        this.stage.loadConfig(JSON.parse(data));
                        this.resetChanges();

                        this.projectFile = file;

                        events.emit('project-loaded');
                    })
                    .catch(error => {
                        raiseError('Invalid project file.', error);
                    });
                }
                else {
                    throw error;
                }
            })
            .catch(error => {
                raiseError('Failed to open project file.', error);
            });
    }

    saveConfigFile(config) {
        let data = JSON.stringify(config);

        return IO.writeFileCompressed(APP_CONFIG_FILE, data)
            .then(() => {
                logger.log('Config file saved:', APP_CONFIG_FILE, config);

                Object.assign(this.config, config);

                this.emit('config-updated');
            })
            .catch(error => {
                raiseError('Failed to save config file.', error);
            });
    }

    saveImage(filename) {
        let stage = this.stage,
            data = this.getFrameData(true);

        stage.render(data, () => {
            stage.getImage(buffer => {
                IO.writeFile(filename, buffer)
                    .then(() => {
                        logger.log('Image saved:', filename);
                    })
                    .catch(error => {
                        raiseError('Failed to save image file.', error);
                    });
            });
        });
    }

    saveVideo(videoFile, audioFile, options) {
        if (this.hasAudio()) {
            logger.time('video-render');

            let renderer = this.renderer = new VideoRenderer(videoFile, audioFile, options),
                { showWatermark } = this.config,
                hasLicense = this.license.check();

            // Setup before rendering
            this.stopRender();
            this.stopAudio();
            this.showWatermark(showWatermark || !hasLicense);

            // Handle events
            renderer.on('ready', () => {
                this.renderFrame(renderer.currentFrame, options.fps, image => {
                    renderer.processFrame(image);
                });
            });

            renderer.on('complete', () => {
                logger.timeEnd('video-render', 'Render complete.');

                this.renderer = null;
                this.showWatermark(showWatermark);

                this.startRender();
            });

            // Start render
            //renderer.start();
        }
        else {
            raiseError('No audio loaded.');
        }
    }

    saveProject(file) {
        let data, sceneData;

        sceneData = this.stage.getScenes().map(scene => {
            return scene.toJSON();
        });

        data = JSON.stringify({
            version: APP_VERSION,
            stage: this.stage.toJSON(),
            scenes: sceneData
        });

        return IO.writeFileCompressed(file, data)
            .then(() => {
                logger.log('Project saved:', file);

                this.resetChanges();

                this.projectFile = file;
            })
            .catch(error => {
                raiseError('Failed to save project file.', error);
            });
    }

    newProject() {
        if (this.stage.hasChanges()) {
            events.emit('unsaved-changes', () => {
                this.loadProject(DEFAULT_PROJECT)
                    .then(() => {
                        this.projectFile = '';
                    });
            });
        }
        else {
            this.loadProject(DEFAULT_PROJECT)
                .then(() => {
                    this.projectFile = '';
                });
        }
    }
    //endregion
}
