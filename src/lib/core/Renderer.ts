import { analyzer, events, player, reactors, renderBackend } from '@/app/global';
import transportStore, { tickTransport } from '@/lib/timeline/transport';
import type { RenderFrameData } from '@/lib/types';
import Clock from './Clock';

const VIDEO_RENDERING = -1;

interface FrameOptions {
  fps: number;
  delta: number;
  hasUpdate: boolean;
  playing: boolean;
  offline: boolean;
}

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
  /** The project time the analyzer's current data belongs to. */
  analyzedTime: number | null;

  constructor() {
    this.rendering = false;
    this.clock = new Clock();
    this.time = 0;
    this.frameCount = 0;
    this.rafId = null;
    this.needsRender = true;
    this.continuousReasons = new Set();
    this.silence = null;
    this.analyzedTime = null;

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
      playing: false,
      offline: false,
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

  /**
   * The frame for project time `time`. Every frame, live or offline, is built
   * here, after the analyzer holds the audio for that time, so reactors and
   * everything drawn see one consistent moment.
   */
  private frameAt(
    id: number,
    time: number,
    { fps, delta, hasUpdate, playing, offline }: FrameOptions,
  ): RenderFrameData {
    const { frameData } = this;
    const analysis = player.getAnalysisData({
      fft: analyzer.fft,
      td: analyzer.td,
      gain: analyzer.gain,
      analyzer: analyzer.analyzer,
    });

    frameData.id = id;
    frameData.time = time;
    frameData.duration = transportStore.getState().duration;
    frameData.fps = fps;
    frameData.delta = delta;
    frameData.hasUpdate = hasUpdate;
    frameData.playing = playing;
    frameData.offline = offline;
    frameData.audioPlaying = player.isPlaying();
    frameData.gain = analysis.gain;
    // Analyzer gain is the mean of the byte FFT (0-255); expose a normalized level.
    frameData.volume = Math.min(1, Math.max(0, (analysis.gain ?? 0) / 255));
    frameData.fft = analysis.fft;
    frameData.td = analysis.td;
    frameData.inputMode = player.getMode();
    frameData.isLive = player.isLive();
    frameData.sourceLabel = player.getSourceLabel();
    frameData.midiActivity = analysis.activity;
    frameData.reactors = reactors.getResults(frameData);

    return frameData;
  }

  /** Point the analyzer at the audio for project `time`, from the loaded file. */
  private analyzeAt(time: number) {
    analyzer.process(this.getAudioSample(time));
    this.analyzedTime = time;
  }

  /**
   * The live frame at the playhead. While playing, analysis comes from the
   * audio as it plays; while paused, from the file at the playhead, so a
   * scrubbed or previewed frame looks the same as when it plays.
   */
  private liveFrame(id: number): RenderFrameData {
    const time = tickTransport();
    const transport = transportStore.getState();
    let hasUpdate = false;

    if (player.isPlaying()) {
      player.updateAnalysis(analyzer);
      this.analyzedTime = time;
      hasUpdate = true;
    } else if (transport.playing) {
      // Playing past the audio (or without any): feed silence so reactors settle.
      analyzer.process(this.getSilence());
      this.analyzedTime = time;
      hasUpdate = true;
    } else if (!player.isLive() && this.analyzedTime !== time) {
      this.analyzeAt(time);
      hasUpdate = true;
    }

    return this.frameAt(id, time, {
      fps: transport.fps,
      delta: this.clock.delta,
      hasUpdate,
      playing: transport.playing,
      offline: false,
    });
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

  /**
   * Render project time `time` offline, as export and previews do, and return
   * its pixels once every layer is ready and the frame is presented. The live
   * view catches up with the playhead on its next frame.
   */
  renderAt(time: number, fps: number): Promise<Uint8Array> {
    this.analyzeAt(time);

    return renderBackend.renderExportFrame(
      this.frameAt(VIDEO_RENDERING, time, {
        fps,
        delta: 1000 / fps,
        hasUpdate: true,
        playing: true,
        offline: true,
      }),
    );
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

    const data = this.liveFrame(id);

    renderBackend.render(data);

    events.emit('render', data);

    if (this.shouldKeepRendering() || this.needsRender) {
      this.scheduleRender();
      return;
    }

    this.rendering = false;
  }
}
