import { events, stage, player, analyzer, reactors } from 'view/global';
import { clamp } from 'utils/math';
import Clock from './Clock';

const STOP_RENDERING = 0;
const VIDEO_RENDERING = -1;

export default class Renderer {
  constructor() {
    this.rendering = false;
    this.clock = new Clock();

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
    const { frameData, clock: { delta } } = this;
    const playing = player.isPlaying();

    frameData.id = id;
    frameData.hasUpdate = playing || id === VIDEO_RENDERING;
    frameData.audioPlaying = playing;
    frameData.gain = analyzer.gain;
    frameData.fft = analyzer.fft;
    frameData.td = analyzer.td;
    frameData.reactors = reactors.getResults(frameData);
    frameData.delta = delta;

    return frameData;
  }

  getAudioSample(time) {
    const { fftSize } = analyzer.analyzer;
    const audio = player.getAudio();
    const pos = audio.getBufferPosition(time);
    const start = pos - fftSize / 2;
    const end = pos + fftSize / 2;

    return audio.getAudioSlice(start, end);
  }

  getFPS() {
    return this.clock.getFPS();
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

    this.clock.update();

    if (player.isPlaying()) {
      analyzer.process();
    }

    const data = this.getFrameData(id);

    stage.render(data);

    events.emit('render', data);
  }
}
