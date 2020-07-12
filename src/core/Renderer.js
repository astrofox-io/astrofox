import { events, stage, player, analyzer, reactors, audioContext } from 'view/global';

const FPS_POLL_INTERVAL = 500;
const STOP_RENDERING = 0;
const VIDEO_RENDERING = -1;

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
      volume: 0,
      audioPlaying: false,
      hasUpdate: false,
      reactors: {},
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

    this.frameData.id = STOP_RENDERING;
    this.frameData.time = 0;
    this.rendering = false;
  }

  getFrameData(id) {
    const { frameData } = this;
    const isPlaying = player.isPlaying();
    const requestUpdate = isPlaying || id === VIDEO_RENDERING;

    frameData.id = id;
    frameData.fft = analyzer.getFrequencyData(requestUpdate);
    frameData.td = analyzer.getTimeData(requestUpdate);
    frameData.volume = analyzer.getVolume();
    frameData.volume = player.getVolume();
    frameData.audioPlaying = isPlaying;
    frameData.hasUpdate = !!requestUpdate;

    // Rendering single frame
    if (frameData.id === 0) {
      // Fix time data display bug
      frameData.td = frameData.td.subarray(0, ~~(frameData.td.length * 0.93));
    }

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
      frameStats.fps = Math.round(frameStats.frames / ((now - frameStats.time) / 1000));
      frameStats.ms = (now - frameStats.time) / frameStats.frames;
      frameStats.time = now;
      frameStats.frames = 0;
      frameStats.stack.copyWithin(1, 0);
      frameStats.stack[0] = frameStats.fps;

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
          const data = this.getFrameData(VIDEO_RENDERING);

          data.delta = 1000 / fps;

          stage.render(data);

          const buffer = stage.getImage();

          bufferSource.disconnect();

          resolve(buffer);
        };

        bufferSource.start(0, frame / fps, 1 / fps);
      } catch (e) {
        reject(e);
      }
    });
  }

  render() {
    const now = Date.now();
    const id = window.requestAnimationFrame(this.render);
    const data = this.getFrameData(id);

    data.delta = now - data.time;
    data.time = now;

    stage.render(data);

    events.emit('render', data);

    this.updateFPS(now);
  }
}
