'use strict';

const _ = require('lodash');
const remote = window.require('electron').remote;

const Window = require('../Window.js');
const IO = require('../IO.js');
const EventEmitter = require('../core/EventEmitter.js');
const Timer = require('../core/Timer.js');
const Player = require('../audio/Player.js');
const BufferedSound = require('../audio/BufferedSound.js');
const SpectrumAnalyzer = require('../audio/SpectrumAnalyzer.js');
const Stage = require('../display/Stage.js');
const Scene = require('../display/Scene.js');
const Display = require('../display/Display.js');
const DisplayLibrary = require('../lib/DisplayLibrary.js');
const EffectsLibrary = require('../lib/EffectsLibrary.js');
const VideoRenderer = require('../video/VideoRenderer.js');

const menuConfig = require('../../conf/menu.json');

const VERSION = '1.0';

const defaults = {
    fps: 29.97,
    canvasWidth: 854,
    canvasHeight: 480,
    useCompression: false
};

const FPS_POLL_INTERVAL = 500;

class Application extends EventEmitter {
    constructor() {
        super();
    
        this.audioContext = new window.AudioContext();
        this.audioFile = null;
    
        this.player = new Player(this.audioContext);
        this.stage = new Stage();
        this.timer = new Timer();
        this.options = Object.assign({}, defaults);
        this.spectrum = new SpectrumAnalyzer(this.audioContext);
    
        this.player.on('play', this.updateAnalyzer.bind(this));
        this.player.on('stop', this.updateAnalyzer.bind(this));
    
        this.frameData = {
            id: null,
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
        // Create menu for OSX
        if (process.platform === 'darwin') {
            menuConfig.forEach((menuItem) => {
                if (menuItem.submenu) {
                    menuItem.submenu.forEach((subMenuItem) => {
                        subMenuItem.click = (item, win, e) => {
                            this.emit('menu_action', menuItem.label + '/' + subMenuItem.label, subMenuItem.checked);
                        };
                    }, this);
                }
            }, this);

            const menu = remote.Menu.buildFromTemplate(menuConfig);

            remote.Menu.setApplicationMenu(menu);
        }

        this.startRender();
    }

    loadAudioFile(file) {
        this.emit('audio_file_loading');

        this.getAudioData(file)
            .then(data => {
                return this.loadAudioData(data);
            })
            .catch(error => {
                this.emit('error', error);
            })
            .then(() => {
                this.emit('audio_file_loaded');
            });
    }

    getAudioData(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader(),
                player = this.player,
                timer = this.timer;

            player.stop('audio');

            reader.onload = (e) => {
                // DEBUG
                console.log('file loaded', timer.get('file_load'));

                resolve(e.target.result);
            };

            reader.onerror = () => {
                reject(file.error);
            };

            timer.set('file_load');

            if (typeof file === 'string') {
                this.audioFile = file;
                file = IO.readFileAsBlob(file);
            }

            reader.readAsArrayBuffer(file);
        });
    }

    loadAudioData(data) {
        return new Promise((resolve, reject) => {
            let player = this.player,
                spectrum = this.spectrum,
                timer = this.timer,
                sound = new BufferedSound(this.audioContext);

            sound.on('load', () => {
                // DEBUG
                console.log('sound loaded', timer.get('sound_load'));

                player.load('audio', sound, () => {
                    sound.addNode(spectrum.analyzer);
                });

                player.play('audio');

                resolve();
            }, this);

            sound.on('error', (error) => {
                reject(error);
            });

            timer.set('sound_load');
            sound.load(data);
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

            this.emit('tick', stats);
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

        this.emit('render', data);

        this.updateFPS(now);
    }

    saveImage(filename) {
        let stage = this.stage,
            data = this.getFrameData();

        stage.renderFrame(data, () => {
            stage.getImage(buffer => {
                IO.fs.writeFile(filename, buffer, err => {
                    if (err) {
                        this.emit('error', new Error(err));
                    }

                    // DEBUG
                    console.log(filename + ' saved.');
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
            this.emit('error', new Error('No audio loaded.'));
        }

        // DEBUG
        console.log(filename + ' saved');
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

    saveProject(filename) {
        let data, sceneData,
            options = this.options;

        sceneData = this.stage.getScenes().map(scene => {
            return scene.toJSON();
        });

        data = {
            version: VERSION,
            scenes: sceneData
        };

        if (options.useCompression) {
            IO.zlib.deflate(
                JSON.stringify(data),
                (err, buf) => {
                    IO.fs.writeFileSync(filename, new IO.Buffer(buf));
                }
            );
        }
        else {
            IO.fs.writeFile(filename, JSON.stringify(data));
        }

        // DEBUG
        console.log(filename + ' saved.');
    }

    loadProject(filename) {
        let options = this.options;

        let data = IO.fs.readFileSync(filename);

        if (options.useCompression) {
            IO.zlib.inflate(data, (err, buf) => {
                try {
                    this.loadControls(JSON.parse(buf.toString()));
                }
                catch (err) {
                    this.raiseError('Invalid project data.', err);
                }
            });
        }
        else {
            try {
                this.loadControls(JSON.parse(data));
            }
            catch (err) {
                this.raiseError('Invalid project data.', err);
            }
        }
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
                            console.warn('Display "' + display.name + '" not found.');
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
                            console.warn('Effect "' + effect.name + '" not found.');
                        }
                    }, this);
                }
            });

            this.emit('control_added');
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

    raiseError(msg, e) {
        if (e) console.error(e);
        this.emit('error', new Error(msg));
    }
}

module.exports = new Application();
