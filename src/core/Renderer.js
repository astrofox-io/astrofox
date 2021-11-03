import { events, stage, player, analyzer, reactors, audioContext } from 'view/global';
import { clamp } from 'utils/math';

const FPS_POLL_INTERVAL = 500;
const STOP_RENDERING = 0;
const VIDEO_RENDERING = -1;

export default class Renderer {
  constructor() {
    this.rendering = false;
    this.time = 0;

    // Frame render data
    this.frameData = {
      id: 0,
      delta: 0,
      fft: null,
      td: null,
      volume: 0,
      audioPlaying: false,
      hasUpdate: false,
      reactors: {},
    };

    // Rendering statistics
    this.frameStats = {
      fps: 0,
      frames: 0,
    };

    // Bind context
    this.render = this.render.bind(this);
    this.resetAnalyzer = this.resetAnalyzer.bind(this);

    // Events
    player.on('playback-change', this.resetAnalyzer);
  }

  resetAnalyzer() {
    const audio = player.getAudio();

    if (audio && !audio.paused) {
      analyzer.clearFrequencyData();
      analyzer.clearTimeData();
    }
  }

  start() {
    if (!this.rendering) {
      this.time = Date.now();
      this.rendering = true;

      this.resetAnalyzer();
      this.render();
    }
  }

  stop() {
    const { id } = this.frameData;

    if (id) {
      window.cancelAnimationFrame(id);
    }

    this.frameData.id = STOP_RENDERING;
    this.rendering = false;
  }

  getFrameData(id) {
    const { frameData } = this;
    const isPlaying = player.isPlaying();

    frameData.id = id;
    frameData.fft = analyzer.getFrequencyData();
    frameData.td = analyzer.getTimeData();
    frameData.volume = analyzer.getVolume();
    frameData.reactors = reactors.getResults(frameData);
    frameData.audioPlaying = isPlaying;
    frameData.hasUpdate = isPlaying || id === VIDEO_RENDERING;

    return frameData;
  }

  updateFPS(now) {
    const { frameStats } = this;

    if (!frameStats.time) {
      frameStats.time = now;
    }

    frameStats.frames += 1;

    if (now > frameStats.time + FPS_POLL_INTERVAL) {
      frameStats.fps = clamp(Math.round(frameStats.frames / ((now - frameStats.time) / 1000)), 0, 60);
      frameStats.time = now;
      frameStats.frames = 0;

      events.emit('tick', frameStats);
    }
  }

  renderFrame(frame, fps) {
    return new Promise((resolve, reject) => {
      try {
        const audio = player.getAudio();
        const bufferSource = audioContext.createBufferSource();

        bufferSource.buffer = audio.buffer;
        bufferSource.connect(analyzer.analyzer);

        bufferSource.onended = () => {
          analyzer.update(VIDEO_RENDERING);

          const data = this.getFrameData(VIDEO_RENDERING);

          data.delta = 1000 / fps;

          stage.render(data);

          bufferSource.disconnect();

          resolve(stage.getPixels());
        };

        bufferSource.start(0, frame / fps, 1 / fps);
      } catch (e) {
        reject(e);
      }
    });
  }

  render() {
    analyzer.update();

    const now = Date.now();
    const id = window.requestAnimationFrame(this.render);
    const data = this.getFrameData(id);

    data.delta = now - this.time;

    stage.render(data);

    events.emit('render', data);

    this.time = now;

    this.updateFPS(now);

  }
}
