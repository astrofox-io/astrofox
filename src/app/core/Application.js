import id3 from 'id3js';
import { remote } from 'electron';
import { APP_VERSION, APP_CONFIG_FILE, DEFAULT_PROJECT, LICENSE_FILE } from 'core/Environment';
import { events, logger, raiseError } from 'app/global';
import { PUBLIC_KEY } from 'app/constants';
import { uniqueId } from 'utils/crypto';
import * as IO from 'utils/io';
import AppUpdater from 'core/AppUpdater';
import EventEmitter from 'core/EventEmitter';
import LicenseManager from 'core/LicenseManager';
import Player from 'audio/Player';
import Audio from 'audio/Audio';
import SpectrumAnalyzer from 'audio/SpectrumAnalyzer';
import Stage from 'core/Stage';
import VideoRenderer from 'video/VideoRenderer';
import appConfig from 'config/app.json';
import menuConfig from 'config/menu.json';

const FPS_POLL_INTERVAL = 500;

export default class Application extends EventEmitter {
    constructor() {
        super();

        remote.getCurrentWindow().removeAllListeners();

        this.audioContext = new window.AudioContext();
        this.player = new Player(this.audioContext);
        this.stage = new Stage();
        this.updater = new AppUpdater();
        this.license = new LicenseManager(PUBLIC_KEY);
        this.analyzer = new SpectrumAnalyzer(this.audioContext);
        this.renderer = null;

        this.audioFile = '';
        this.projectFile = '';
        this.rendering = false;

        // Default configuration
        this.config = { ...appConfig };

        // Frame render data
        this.frameData = {
            id: 0,
            time: 0,
            delta: 0,
            fft: null,
            td: null,
            reactor: null,
            volume: 0,
            playing: 0,
        };

        // Rendering statistics
        this.stats = {
            fps: 0,
            ms: 0,
            time: 0,
            frames: 0,
            stack: new Uint8Array(10),
        };

        // App events
        this.on('config-updated', () => {
            this.showWatermark(this.config.showWatermark);
        });

        // Player events
        this.player.on('play', this.resetAnalyzer, this);
        this.player.on('pause', this.resetAnalyzer, this);
        this.player.on('stop', this.resetAnalyzer, this);

        // Handle uncaught errors
        window.onerror = (msg, src, line, col, err) => {
            raiseError(msg, err);
            return true;
        };

        // Apply OS specific styles
        window.onload = () => {
            window.document.body.className = process.platform;
        };

        // Bind context
        this.render = this.render.bind(this);
    }

    // region Main Methods
    init() {
        // Check for license
        this.license.load(LICENSE_FILE);

        // Load config file
        this.loadConfig()
            .then(() => {
                const { checkForUpdates, autoUpdate } = this.config;

                // Set update policy from config
                this.updater.options.autoUpdate = !!autoUpdate;

                // Check for app updates
                if (checkForUpdates) {
                    this.updater.checkForUpdates();
                }
            });

        // Create app menu
        const menu = [];

        menuConfig.forEach((root) => {
            if (process.env.NODE_ENV !== 'production') {
                if (root.visible !== false) {
                    menu.push(root);
                }
            }
            else {
                menu.push(root);
            }

            if (root.submenu) {
                root.submenu.forEach((item) => {
                    if (item.action && !item.role) {
                        // eslint-disable-next-line no-param-reassign
                        item.click = this.doMenuAction;
                    }
                });
            }
        });

        remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(menu));

        // Load default project
        this.newProject();
    }

    doMenuAction(menuItem) {
        events.emit('menu-action', menuItem.action);
    }

    resetAnalyzer() {
        const { analyzer } = this;
        const audio = this.player.getAudio();

        if (audio && !audio.paused) {
            analyzer.clearFrequencyData();
            analyzer.clearTimeData();
        }
    }

    resetChanges() {
        this.stage.resetChanges();
    }

    isRendering() {
        return this.rendering;
    }
    // endregion

    // region Render Methods
    startRender() {
        if (!this.rendering) {
            this.resetAnalyzer();
            this.render();
            this.rendering = true;
        }
    }

    stopRender() {
        const { id } = this.frameData;

        if (id) {
            window.cancelAnimationFrame(id);
        }

        this.frameData.id = 0;
        this.rendering = false;
    }

    render() {
        const now = window.performance.now();
        const playing = this.player.isPlaying();
        const data = this.getFrameData(playing);

        data.id = window.requestAnimationFrame(this.render);
        data.delta = now - data.time;
        data.time = now;

        this.stage.render(data);

        events.emit('render', data);

        this.updateFPS(now);
    }

    renderFrame(frame, fps, callback) {
        const {
            analyzer,
            stage,
        } = this;
        const audio = this.player.getAudio();
        const source = this.audioContext.createBufferSource();
        let data;
        let image;

        source.buffer = audio.buffer;
        source.connect(analyzer.analyzer);

        source.onended = () => {
            data = this.getFrameData(true);
            data.delta = 1000 / fps;

            stage.render(data, () => {
                stage.getImage((buffer) => {
                    image = buffer;
                });
            });

            source.disconnect();

            callback(image);
        };

        source.start(0, frame / fps, 1 / fps);
    }

    getFrameData(update) {
        const { frameData, analyzer, player } = this;

        frameData.fft = analyzer.getFrequencyData(update);
        frameData.td = analyzer.getTimeData(update);
        frameData.volume = analyzer.getVolume();
        frameData.hasUpdate = update;
        frameData.playing = player.isPlaying();

        // Rendering single frame
        if (frameData.id === 0) {
            // Fix time data display bug
            frameData.td = frameData.td.subarray(0, ~~(frameData.td.length * 0.93));
        }

        return frameData;
    }

    updateFPS(now) {
        const { stats } = this;

        if (!stats.time) {
            stats.time = now;
        }

        stats.frames += 1;

        if (now > stats.time + FPS_POLL_INTERVAL) {
            stats.fps = Math.round(stats.frames / ((now - stats.time) / 1000));
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
            enabled: show,
        });
    }
    // endregion

    // region Save/load Methods
    loadConfig() {
        if (IO.fileExists(APP_CONFIG_FILE)) {
            return IO.readFileCompressed(APP_CONFIG_FILE)
                .then((data) => {
                    const config = JSON.parse(data);

                    logger.log('Config file loaded:', APP_CONFIG_FILE, config);

                    Object.assign(this.config, config);

                    this.emit('config-updated');
                });
        }

        return this.saveConfig({ uid: uniqueId(), ...this.config });
    }

    loadAudioFile(file) {
        this.player.stop();

        logger.time('audio-file-load');

        return IO.readFileAsBlob(file)
            .then(blob => IO.readAsArrayBuffer(blob))
            .then(data => this.loadAudioData(data))
            .then(() => {
                this.audioFile = file;

                this.loadAudioTags(file);

                if (this.config.autoPlayAudio) {
                    this.player.play();
                }

                logger.timeEnd('audio-file-load', 'Audio file loaded:', file);

                return file;
            })
            .catch((error) => {
                raiseError('Invalid audio file.', error);
            });
    }

    loadAudioData(data) {
        return new Promise((resolve, reject) => {
            const {
                player,
                analyzer,
            } = this;
            const audio = new Audio(this.audioContext);

            audio.load(data)
                .then(() => {
                    player.load(audio);

                    audio.addNode(analyzer.analyzer);

                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    loadAudioTags(file) {
        return IO.readFileAsBlob(file)
            .then((data) => {
                id3({ file: data, type: id3.OPEN_FILE }, (err, tags) => {
                    if (!err) {
                        events.emit('audio-tags', tags);
                    }
                });
            });
    }

    loadProject(file) {
        return IO.readFileCompressed(file)
            .then(
                (data) => {
                    this.stage.loadConfig(JSON.parse(data));
                    this.resetChanges();

                    this.projectFile = file;

                    events.emit('project-loaded');
                },
                (error) => {
                    if (error.message.indexOf('incorrect header check') > -1) {
                        IO.readFile(file)
                            .then((data) => {
                                this.stage.loadConfig(JSON.parse(data));
                                this.resetChanges();

                                this.projectFile = file;

                                events.emit('project-loaded');
                            })
                            .catch((err) => {
                                raiseError('Invalid project file.', err);
                            });
                    }
                    else {
                        throw error;
                    }
                },
            )
            .catch((error) => {
                raiseError('Invalid project file.', error);
            });
    }

    saveConfig(config) {
        const data = JSON.stringify(config);

        return IO.writeFileCompressed(APP_CONFIG_FILE, data)
            .then(() => {
                logger.log('Config file saved:', APP_CONFIG_FILE, config);

                Object.assign(this.config, config);

                this.emit('config-updated');
            })
            .catch((error) => {
                raiseError('Failed to save config file.', error);
            });
    }

    saveImage(filename) {
        const { stage } = this;
        const data = this.getFrameData(false);

        stage.render(data, () => {
            stage.getImage((buffer) => {
                IO.writeFile(filename, buffer)
                    .then(() => {
                        logger.log('Image saved:', filename);
                    })
                    .catch((error) => {
                        raiseError('Failed to save image file.', error);
                    });
            });
        });
    }

    saveVideo(videoFile, audioFile, options) {
        if (this.player.getAudio()) {
            logger.time('video-render');

            this.renderer = new VideoRenderer(videoFile, audioFile, options);

            const { renderer, license } = this;
            const { showWatermark } = this.config;

            // Setup before rendering
            this.stopRender();
            this.player.stop();
            this.showWatermark(showWatermark || !license.valid);

            // Handle events
            renderer.on('ready', () => {
                this.renderFrame(renderer.currentFrame, options.fps, (image) => {
                    renderer.processFrame(image);
                });
            });

            renderer.on('complete', () => {
                logger.timeEnd('video-render', 'Render complete.');

                this.renderer = null;

                // Reset watermark status
                this.showWatermark(showWatermark);

                this.startRender();
            });
        }
        else {
            raiseError('No audio loaded.');
        }
    }

    saveProject(file) {
        const sceneData = this.stage.scenes.items.map(scene => scene.toJSON());

        const data = JSON.stringify({
            version: APP_VERSION,
            stage: this.stage.toJSON(),
            scenes: sceneData,
        });

        return IO.writeFileCompressed(file, data)
            .then(() => {
                logger.log('Project saved:', file);

                this.resetChanges();

                this.projectFile = file;
            })
            .catch((error) => {
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
    // endregion
}
