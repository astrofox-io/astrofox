import type Audio from '@/lib/audio/Audio';
import MidiController, { type MidiAnalysisData } from '@/lib/audio/MidiController';
import EventEmitter from '@/lib/core/EventEmitter';

export type InputMode = 'file' | 'microphone' | 'midi' | 'desktop';

export interface PlayerCapabilities {
  canSeek: boolean;
  hasWaveform: boolean;
  usesVolume: boolean;
  isLive: boolean;
}

/**
 * The audio source (a loaded file or a live input) and its Web Audio graph.
 * Playback is the Transport's: it drives the player through
 * `playerOutput()`, and nothing else calls play, pause or seek.
 *
 * Events: `source-change` (plus `audio-load` / `audio-unload`) when the source
 * changes, `playback-change` when it starts or stops sounding.
 */
export default class Player extends EventEmitter {
  audioContext: AudioContext;
  volume: GainNode;
  inputGain: GainNode;
  audio: Audio | null;
  mode: InputMode | null;
  sourceLabel: string;
  stream: MediaStream | null;
  streamSource: MediaStreamAudioSourceNode | null;
  streamAnalyzer: AudioNode | null;
  liveActive: boolean;
  midi: MidiController;

  constructor(context: AudioContext) {
    super();

    this.audioContext = context;
    this.audio = null;
    this.mode = null;
    this.sourceLabel = '';
    this.stream = null;
    this.streamSource = null;
    this.streamAnalyzer = null;
    this.liveActive = false;
    this.midi = new MidiController();

    this.volume = this.audioContext.createGain();
    this.volume.connect(this.audioContext.destination);
    this.inputGain = this.audioContext.createGain();
  }

  load(audio: Audio, sourceLabel = '') {
    this.clearSource();

    this.audio = audio;
    this.mode = 'file';
    this.sourceLabel = sourceLabel;
    this.audio.addNode(this.volume);

    this.emit('source-change');
    this.emit('audio-load');
  }

  useMicrophone(stream: MediaStream, analyzerNode: AudioNode, sourceLabel = 'Microphone') {
    this.clearSource();

    this.mode = 'microphone';
    this.sourceLabel = sourceLabel;
    this.stream = stream;
    this.streamAnalyzer = analyzerNode;
    this.streamSource = this.audioContext.createMediaStreamSource(stream);

    this.emit('source-change');
  }

  useDesktopAudio(stream: MediaStream, analyzerNode: AudioNode, sourceLabel = '') {
    this.clearSource();

    this.mode = 'desktop';
    this.sourceLabel = sourceLabel;
    this.stream = stream;
    this.streamAnalyzer = analyzerNode;
    this.streamSource = this.audioContext.createMediaStreamSource(stream);

    this.emit('source-change');
  }

  useMidi(sourceLabel = '') {
    this.clearSource();

    this.mode = 'midi';
    this.sourceLabel = sourceLabel;

    this.emit('source-change');
  }

  unload() {
    this.clearSource();
  }

  clearSource() {
    this.releaseAudio();
    this.releaseStream();
    this.releaseMidi();

    const hadSource = this.mode !== null;

    this.mode = null;
    this.sourceLabel = '';

    if (hadSource) {
      this.emit('source-change');
      this.emit('audio-unload');
    }
  }

  releaseAudio() {
    const { audio } = this;

    if (audio) {
      this.stop();
      audio.unload();
      this.audio = null;
    }
  }

  releaseStream() {
    if (this.streamSource) {
      try {
        this.streamSource.disconnect();
      } catch (_error) {
        // Ignore disconnect errors from a stale MediaStream source.
      }
    }

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
    }

    this.stream = null;
    this.streamSource = null;
    this.streamAnalyzer = null;
    this.inputGain.disconnect();
    this.liveActive = false;
  }

  releaseMidi() {
    this.midi.reset();
    this.liveActive = false;
  }

  reconnectLiveNodes() {
    if (!this.streamSource || !this.streamAnalyzer) {
      return;
    }

    this.streamSource.connect(this.inputGain);
    this.inputGain.connect(this.streamAnalyzer);
  }

  disconnectLiveNodes() {
    if (!this.streamSource) {
      return;
    }

    try {
      this.streamSource.disconnect();
      this.inputGain.disconnect();
    } catch (_error) {
      // Ignore disconnect errors from already detached nodes.
    }
  }

  /** Start sounding: play the file from its position, or start listening to the live input. */
  play() {
    const { audio, mode } = this;

    if (this.isPlaying()) {
      return;
    }

    if (mode === 'file' && audio) {
      audio.play();
    } else if ((mode === 'microphone' || mode === 'desktop') && this.streamSource) {
      this.reconnectLiveNodes();
      this.liveActive = true;
    } else if (mode === 'midi') {
      this.liveActive = true;
    } else {
      return;
    }

    this.emit('playback-change');
  }

  /** Stop sounding, keeping the file's position. */
  pause() {
    const { audio, mode } = this;

    if (mode === 'file' && audio) {
      if (!audio.playing) {
        return;
      }

      audio.pause();
    } else if (this.liveActive) {
      if (mode === 'microphone' || mode === 'desktop') {
        this.disconnectLiveNodes();
      }

      this.liveActive = false;
    } else {
      return;
    }

    this.emit('playback-change');
  }

  /** Stop sounding and rewind the file. */
  stop() {
    const { audio, mode } = this;

    if (mode === 'file' && audio) {
      audio.stop();
      this.emit('playback-change');
      return;
    }

    this.pause();
  }

  /** Seek the loaded audio to an absolute time in seconds. */
  seekTime(time: number) {
    const { audio } = this;

    if (audio) {
      audio.seekTime(time);
    }
  }

  getAudio() {
    return this.audio;
  }

  hasAudio() {
    return this.mode === 'file'
      ? !!this.getAudio()
      : this.mode === 'microphone' || this.mode === 'desktop';
  }

  hasSource() {
    return this.mode !== null;
  }

  setVolume(val: number) {
    if (this.volume) {
      this.volume.gain.value = val;
    }
  }

  getVolume() {
    return this.volume.gain.value;
  }

  setInputGain(val: number) {
    this.inputGain.gain.value = val;
  }

  getInputGain() {
    return this.inputGain.gain.value;
  }

  getCurrentTime() {
    const { audio } = this;

    if (audio) {
      return audio.getCurrentTime();
    }
    return 0;
  }

  getDuration() {
    const { audio, mode } = this;

    if (mode === 'file' && audio) {
      return audio.getDuration();
    }

    return 0;
  }

  isPlaying() {
    if (this.mode === 'file') {
      return !!this.audio?.playing;
    }

    return this.liveActive;
  }

  canSeek() {
    return this.mode === 'file' && !!this.audio;
  }

  isLive() {
    return this.mode === 'microphone' || this.mode === 'desktop' || this.mode === 'midi';
  }

  getMode() {
    return this.mode;
  }

  getSourceLabel() {
    return this.sourceLabel;
  }

  getCapabilities(): PlayerCapabilities {
    return {
      canSeek: this.canSeek(),
      hasWaveform: this.canSeek(),
      usesVolume: this.mode !== 'midi' && this.mode !== null,
      isLive: this.isLive(),
    };
  }

  updateAnalysis(analyzer: {
    process: (input?: AudioBuffer) => void;
    analyzer: { fftSize: number };
  }) {
    if (!this.isPlaying()) {
      return;
    }

    if (this.mode === 'midi') {
      this.midi.updateAnalysis(analyzer.analyzer.fftSize, this.audioContext.currentTime);
      return;
    }

    analyzer.process(undefined);
  }

  getAnalysisData(analyzer: {
    fft: Uint8Array;
    td: Float32Array;
    gain: number;
    analyzer: { fftSize: number };
  }):
    | MidiAnalysisData
    | {
        fft: Uint8Array;
        td: Float32Array;
        gain: number;
        activity: number;
      } {
    if (this.mode === 'midi') {
      return this.midi.getAnalysisData();
    }

    return {
      fft: analyzer.fft,
      td: analyzer.td,
      gain: analyzer.gain,
      activity: 0,
    };
  }

  handleMidiMessage(event: { data?: Uint8Array | number[] | null }) {
    this.midi.handleMessage(event);
  }
}
