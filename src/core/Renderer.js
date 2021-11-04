import { events, stage, player, analyzer, reactors } from 'view/global';
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

    // Events
    player.on('playback-change', this.resetAnalyzer);
  }

  resetAnalyzer() {
    const audio = player.getAudio();

    if (audio && !audio.paused) {
      analyzer.reset();
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
    const playing = player.isPlaying();

    frameData.id = id;
    frameData.hasUpdate = playing || id === VIDEO_RENDERING;
    frameData.audioPlaying = playing;
    frameData.gain = analyzer.gain;
    frameData.fft = analyzer.fft;
    frameData.td = analyzer.td;
    frameData.reactors = reactors.getResults(frameData);

    return frameData;
  }

  updateFPS(now) {
    const { frameStats } = this;

    if (!frameStats.time) {
      frameStats.time = now;
    }

    frameStats.frames += 1;

    if (now > frameStats.time + FPS_POLL_INTERVAL) {
      frameStats.fps = clamp(
        Math.round(frameStats.frames / ((now - frameStats.time) / 1000)),
        0,
        60,
      );
      frameStats.time = now;
      frameStats.frames = 0;

      events.emit('tick', frameStats);
    }
  }

  getAudioSample(time) {
    const { fftSize } = analyzer.analyzer;
    const audio = player.getAudio();
    const pos = audio.getBufferPosition(time);
    const start = pos - fftSize / 2;
    const end = pos + fftSize / 2;

    return audio.getAudioSlice(start, end);
  }

  renderFrame(frame, fps) {
    return new Promise((resolve, reject) => {
      try {
        analyzer.process(this.getAudioSample(frame / fps));

        const frameData = this.getFrameData(VIDEO_RENDERING);
        frameData.delta = 1000 / fps;

        stage.render(frameData);

        resolve(stage.getPixels());
      } catch (e) {
        reject(e);
      }
    });
  }

  render() {
    const id = window.requestAnimationFrame(this.render);

    const now = Date.now();

    if (player.isPlaying()) {
      analyzer.process(this.getAudioSample());
      //analyzer.process();
    }

    const data = this.getFrameData(id);

    data.delta = now - this.time;

    stage.render(data);

    events.emit('render', data);

    this.time = now;

    this.updateFPS(now);
  }
}
