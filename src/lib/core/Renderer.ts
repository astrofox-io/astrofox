import { analyzer, events, player, reactors, renderBackend } from '@/app/global';
import transportStore, { tickTransport } from '@/lib/timeline/transport';
import type { RenderFrameData } from '@/lib/types';
import Clock from './Clock';

const VIDEO_RENDERING = -1;

export default class Renderer {
  rendering: boolean;
  clock: Clock;
  frameData: RenderFrameData;
  time: number;
  frameCount: number;
  rafId: number | null;
  needsRender: boolean;
  continuousReasons: Set<string>;
  silence: AudioBuffer | null;

  constructor() {
    this.rendering = false;
    this.clock = new Clock();
    this.time = 0;
    this.frameCount = 0;
    this.rafId = null;
    this.needsRender = true;
    this.continuousReasons = new Set();
    this.silence = null;

    // Frame render data
    this.frameData = {
      id: 0,
      delta: 0,
      time: 0,
      duration: 0,
      fps: 30,
      fft: null,
      td: null,
      volume: 0,
      gain: 0,
      audioPlaying: false,
      hasUpdate: false,
      reactors: {},
    };

    // Bind context
    this.render = this.render.bind(this);
    this.handlePlaybackChange = this.handlePlaybackChange.bind(this);
    this.handleSourceChange = this.handleSourceChange.bind(this);

    // Events
    player.on('playback-change', this.handlePlaybackChange);
    player.on('source-change', this.handleSourceChange);
  }

  resetAnalyzer() {
    if (player.hasSource()) {
      analyzer.reset();
    }
  }

  handlePlaybackChange() {
    this.resetAnalyzer();
    this.requestRender();
  }

  handleSourceChange() {
    this.requestRender();
  }

  shouldKeepRendering() {
    return (
      player.isPlaying() || transportStore.getState().playing || this.continuousReasons.size > 0
    );
  }

  scheduleRender() {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = window.requestAnimationFrame(this.render);
  }

  start() {
    this.time = Date.now();
    this.rendering = true;
    this.requestRender();
  }

  stop() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.rendering = false;
    this.needsRender = false;
  }

  requestRender() {
    this.needsRender = true;

    if (!this.rendering) {
      this.rendering = true;
    }

    this.scheduleRender();
  }

  setContinuousRendering(reason: string, enabled: boolean) {
    if (enabled) {
      this.continuousReasons.add(reason);
      this.start();
      return;
    }

    this.continuousReasons.delete(reason);
    this.requestRender();
  }

  getFrameData(id: number): RenderFrameData {
    const {
      frameData,
      clock: { delta },
    } = this;
    const playing = player.isPlaying();
    const transport = transportStore.getState();
    const analysis = player.getAnalysisData({
      fft: analyzer.fft,
      td: analyzer.td,
      gain: analyzer.gain,
      analyzer: analyzer.analyzer,
    });

    frameData.id = id;
    frameData.hasUpdate = playing || transport.playing || id === VIDEO_RENDERING;
    frameData.audioPlaying = playing;
    frameData.time = transport.time;
    frameData.duration = transport.duration;
    frameData.fps = transport.fps;
    frameData.gain = analysis.gain;
    // Analyzer gain is the mean of the byte FFT (0-255); expose a normalized level.
    frameData.volume = Math.min(1, Math.max(0, (analysis.gain ?? 0) / 255));
    frameData.fft = analysis.fft;
    frameData.td = analysis.td;
    frameData.reactors = reactors.getResults(frameData);
    frameData.delta = delta;
    frameData.inputMode = player.getMode();
    frameData.isLive = player.isLive();
    frameData.sourceLabel = player.getSourceLabel();
    frameData.midiActivity = analysis.activity;

    return frameData;
  }

  /** A zeroed buffer the analyzer can process for frames with no audio. */
  getSilence() {
    const { fftSize } = analyzer.analyzer;

    if (!this.silence || this.silence.length !== fftSize) {
      this.silence = analyzer.audioContext.createBuffer(
        1,
        fftSize,
        analyzer.audioContext.sampleRate,
      );
    }

    return this.silence;
  }

  /**
   * Audio samples centred on an absolute project time, for offline analysis.
   * Silence outside the loaded audio (or without audio) keeps reactors and
   * analysis deterministic for silent intros and outros.
   */
  getAudioSample(time: number) {
    const { fftSize } = analyzer.analyzer;
    const audio = player.getAudio();
    const buffer = audio?.buffer;

    if (!audio || !buffer) {
      return this.getSilence();
    }

    const center = Math.round(time * buffer.sampleRate);
    const start = center - fftSize / 2;
    const end = center + fftSize / 2;

    if (start >= buffer.length || end <= 0) {
      return this.getSilence();
    }

    // Partial overlap at the edges: copy what exists, leave the rest silent.
    const output = analyzer.audioContext.createBuffer(
      buffer.numberOfChannels,
      fftSize,
      audio.audioContext.sampleRate,
    );
    const from = Math.max(0, start);
    const to = Math.min(buffer.length, end);

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      output.copyToChannel(
        buffer.getChannelData(channel).subarray(from, to),
        channel,
        from - start,
      );
    }

    return output;
  }

  getFPS() {
    return this.clock.getFPS();
  }

  renderFrame(frame: number, fps: number): Promise<Uint8Array> {
    return renderBackend.renderExportFrame({
      frame,
      fps,
      getAudioSample: this.getAudioSample.bind(this),
      analyzer,
      getFrameData: this.getFrameData.bind(this),
    });
  }

  render() {
    this.rafId = null;

    if (!this.rendering) {
      return;
    }

    if (!this.shouldKeepRendering() && !this.needsRender) {
      this.rendering = false;
      return;
    }

    const id = ++this.frameCount;
    this.needsRender = false;

    this.clock.update();

    tickTransport();

    if (player.isPlaying()) {
      player.updateAnalysis(analyzer);
    } else if (transportStore.getState().playing) {
      // Playing past the audio (or without any): feed silence so reactors settle.
      analyzer.process(this.getSilence());
    }

    const data = this.getFrameData(id);

    renderBackend.render(data);

    events.emit('render', data);

    if (this.shouldKeepRendering() || this.needsRender) {
      this.scheduleRender();
      return;
    }

    this.rendering = false;
  }
}
