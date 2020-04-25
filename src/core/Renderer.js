import { events, stage, player, analyzer } from 'view/global';

const FPS_POLL_INTERVAL = 500;

export default class Renderer {
  constructor() {
    this.rendering = false;
    this.frames = 0;

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

    // Bind context
    this.render = this.render.bind(this);

    // Events
    player.on('playback-change', this.resetAnalyzer, this);
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
      this.resetAnalyzer();
      this.render();
      this.rendering = true;
    }
  }

  stop() {
    const { id } = this.frameData;

    if (id) {
      window.cancelAnimationFrame(id);
    }

    this.frameData.id = 0;
    this.rendering = false;
  }

  render() {
    const now = window.performance.now();
    const playing = player.isPlaying();
    const data = this.getFrameData(playing);

    data.id = window.requestAnimationFrame(this.render);
    data.delta = now - data.time;
    data.time = now;

    stage.render(data);

    events.emit('render', data);

    this.updateFPS(now);
  }

  getFrameData(update) {
    const { frameData } = this;

    frameData.fft = analyzer.getFrequencyData(update);
    frameData.td = analyzer.getTimeData(update);
    frameData.volume = analyzer.getVolume();
    frameData.hasUpdate = !!update;
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
}
