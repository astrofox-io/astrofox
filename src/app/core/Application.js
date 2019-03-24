import id3 from 'id3js';
import { remote } from 'electron';
import { APP_VERSION, APP_CONFIG_FILE, LICENSE_FILE } from 'core/Environment';
import { closeWindow, showOpenDialog, showSaveDialog } from 'utils/window';
import { events, logger, raiseError } from 'app/global';
import { PUBLIC_KEY } from 'app/constants';
import { uniqueId } from 'utils/crypto';
import * as IO from 'utils/io';
import AppUpdater from 'core/AppUpdater';
import LicenseManager from 'core/LicenseManager';
import Player from 'audio/Player';
import Audio from 'audio/Audio';
import SpectrumAnalyzer from 'audio/SpectrumAnalyzer';
import Stage from 'core/Stage';
import VideoRenderer from 'video/VideoRenderer';
import appConfig from 'config/app.json';
import menuConfig from 'config/menu.json';
import * as displayLibrary from 'lib/displays';

const FPS_POLL_INTERVAL = 500;

export default class Application {
  constructor() {
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
    this.frameStats = {
      fps: 0,
      ms: 0,
      time: 0,
      frames: 0,
      stack: new Uint8Array(10),
    };

    // Player events
    this.player.on('play', this.resetAnalyzer, this);
    this.player.on('pause', this.resetAnalyzer, this);
    this.player.on('stop', this.resetAnalyzer, this);

    // Updater events
    this.updater.on('status', event => {
      if (event === 'check-for-updates-complete' && this.updater.hasUpdate) {
        events.emit('has-app-update');
      }
    });

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
    const { setApplicationMenu, buildFromTemplate } = remote.Menu;

    // Check for license
    this.license
      .load(LICENSE_FILE)
      // Load config file
      .then(() => this.loadConfig())
      // Set update policy from config
      .then(() => {
        const { checkForUpdates, autoUpdate } = this.config;

        this.updater.options.autoUpdate = !!autoUpdate;

        // Check for app updates
        if (checkForUpdates) {
          this.updater.checkForUpdates();
        }
      });

    // Create app menu
    const menu = [...menuConfig];

    menu.forEach(menuItem => {
      if (menuItem.submenu) {
        menuItem.submenu.forEach(item => {
          if (item.action && !item.role) {
            // eslint-disable-next-line no-param-reassign
            item.click = this.executeAction;
          }
        });
      }
    });

    setApplicationMenu(buildFromTemplate(menu));

    // Load default project
    this.newProject();
  }

  executeAction({ action }) {
    events.emit('menu-action', action);
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

  checkUnsavedChanges(func) {
    if (this.stage.hasChanges()) {
      events.emit('unsaved-changes', func);
    } else {
      func();
    }
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
    const { analyzer, stage } = this;
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
        stage.getImage(buffer => {
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
    const { frameStats } = this;

    if (!frameStats.time) {
      frameStats.time = now;
    }

    frameStats.frames += 1;

    if (now > frameStats.time + FPS_POLL_INTERVAL) {
      frameStats.fps = Math.round(frameStats.frames / ((now - frameStats.time) / 1000));
      frameStats.ms = (now - frameStats.time) / frameStats.frames;
      frameStats.time = now;
      frameStats.frames = 0;
      frameStats.stack.copyWithin(1, 0);
      frameStats.stack[0] = frameStats.fps;

      events.emit('tick', frameStats);
    }
  }
  // endregion

  // region Save/load Methods
  loadConfig() {
    if (IO.fileExists(APP_CONFIG_FILE)) {
      return IO.readFileCompressed(APP_CONFIG_FILE).then(data => {
        const config = JSON.parse(data);

        logger.log('Config file loaded:', APP_CONFIG_FILE, config);

        Object.assign(this.config, config);

        events.emit('config-updated');
      });
    }

    return this.saveConfig({ uid: uniqueId(), ...this.config });
  }

  saveConfig(config) {
    const data = JSON.stringify(config);

    return IO.writeFileCompressed(APP_CONFIG_FILE, data)
      .then(() => {
        logger.log('Config file saved:', APP_CONFIG_FILE, config);

        Object.assign(this.config, config);

        events.emit('config-updated');
      })
      .catch(error => {
        raiseError('Failed to save config file.', error);
      });
  }

  openAudioFile() {
    showOpenDialog(
      files => {
        if (files) {
          this.loadAudioFile(files[0]);
        }
      },
      {
        filters: [
          {
            name: 'Audio files',
            extensions: ['aac', 'mp3', 'm4a', 'ogg', 'wav'],
          },
        ],
      },
    );
  }

  loadAudioFile(file) {
    this.player.stop();

    logger.time('audio-file-load');
    events.emit('audio-file-load');

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
        events.emit('audio-file-loaded');

        return file;
      })
      .catch(error => {
        raiseError('Invalid audio file.', error);
      });
  }

  loadAudioData(data) {
    return new Promise((resolve, reject) => {
      const { player, analyzer } = this;
      const audio = new Audio(this.audioContext);

      audio
        .load(data)
        .then(() => {
          player.load(audio);

          audio.addNode(analyzer.analyzer);

          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  loadAudioTags(file) {
    return IO.readFileAsBlob(file).then(data => {
      id3({ file: data, type: id3.OPEN_FILE }, (err, tags) => {
        if (!err) {
          events.emit('audio-tags', tags);
        }
      });
    });
  }

  saveImage(file) {
    if (file) {
      const { stage } = this;
      const data = this.getFrameData(false);

      stage.render(data, () => {
        stage.getImage(buffer => {
          IO.writeFile(file, buffer)
            .then(() => {
              logger.log('Image saved:', file);
            })
            .catch(error => {
              raiseError('Failed to save image file.', error);
            });
        });
      });
    } else {
      showSaveDialog(
        filename => {
          if (filename) {
            this.saveImage(filename);
          }
        },
        { defaultPath: 'image.png' },
      );
    }
  }

  saveVideo(videoFile, audioFile, options) {
    if (this.player.getAudio()) {
      logger.time('video-render');
      events.emit('video-render-start');

      this.renderer = new VideoRenderer(videoFile, audioFile, options);

      const { renderer } = this;

      // Setup before rendering
      this.stopRender();
      this.player.stop();

      // Handle events
      renderer.on('ready', () => {
        this.renderFrame(renderer.currentFrame, options.fps, image => {
          renderer.processFrame(image);
        });
      });

      renderer.on('complete', () => {
        logger.timeEnd('video-render', 'Render complete.');
        events.emit('video-render-complete');

        this.renderer = null;

        this.startRender();
      });
    } else {
      raiseError('No audio loaded.');
    }
  }

  openProject() {
    showOpenDialog(
      files => {
        if (files) {
          this.checkUnsavedChanges(() => {
            this.loadProject(files[0]);
          });
        }
      },
      {
        filters: [{ name: 'Project files', extensions: ['afx'] }],
      },
    );
  }

  loadProject(file) {
    const loadData = data => {
      this.stage.loadConfig(JSON.parse(data));
      this.resetChanges();
      this.projectFile = file;

      events.emit('project-loaded');
    };

    return IO.readFileCompressed(file)
      .then(loadData, error => {
        if (error.message.indexOf('incorrect header check') > -1) {
          IO.readFile(file)
            .then(loadData)
            .catch(err => {
              raiseError('Invalid project file.', err);
            });
        } else {
          throw error;
        }
      })
      .catch(error => {
        raiseError('Invalid project file.', error);
      });
  }

  saveProject(file, callback) {
    if (file) {
      const sceneData = this.stage.scenes.items.map(scene => scene.toJSON());

      const data = JSON.stringify({
        version: APP_VERSION,
        stage: this.stage.toJSON(),
        scenes: sceneData,
      });

      IO.writeFileCompressed(file, data)
        .then(() => {
          logger.log('Project saved:', file);

          this.resetChanges();

          this.projectFile = file;

          if (callback) callback();
        })
        .catch(error => {
          raiseError('Failed to save project file.', error);
        });
    } else {
      showSaveDialog(
        filename => {
          if (filename) {
            this.saveProject(filename, callback);
          }
        },
        { defaultPath: 'project.afx' },
      );
    }
  }

  newProject() {
    this.checkUnsavedChanges(() => {
      const { stage } = this;

      stage.clearScenes();

      const scene = stage.addScene();

      scene.addElement(new displayLibrary.ImageDisplay());
      scene.addElement(new displayLibrary.BarSpectrumDisplay());
      scene.addElement(new displayLibrary.TextDisplay());

      stage.resetChanges();

      this.projectFile = '';

      events.emit('project-loaded');
    });
  }
  // endregion

  exit() {
    closeWindow();
  }
}
