import { createStore, type StoreApi } from 'zustand/vanilla';
import { t } from '@/i18n/config';

export type LiveInputMode = 'microphone' | 'midi' | 'desktop';
export type AudioMode = 'file' | LiveInputMode;

export interface InputOption {
  id: string;
  label: string;
}

/** What the app plays, as the UI reads it. */
export interface AudioState {
  /** The live-input panel is on: the source is a live input, or about to be. */
  liveModeEnabled: boolean;
  /** The live input chosen in that panel. */
  liveInputMode: LiveInputMode;
  /** The kind of source playing, or about to. */
  mode: AudioMode;
  /** The loaded file's name, when the source is a file. */
  file: string;
  /** The loaded file, for exports that read it. */
  source: File | null;
  /** What is playing: the file name, or the live input's name. '' when nothing is. */
  sourceLabel: string;
  /** The loaded file's duration in seconds; 0 for live input. */
  duration: number;
  /** A source is being connected. */
  loading: boolean;
  /** The loaded file's metadata tags (artist, title). */
  tags: Record<string, unknown> | null;
  error: string | null;
  microphoneDevices: InputOption[];
  selectedMicrophoneId: string;
  midiInputs: InputOption[];
  selectedMidiInputId: string;
  /** Live input gain, in percent (0–300). */
  liveInputGain: number;
  microphoneSupported: boolean;
  desktopAudioSupported: boolean;
  midiSupported: boolean;
}

export const initialAudioState: AudioState = {
  liveModeEnabled: false,
  liveInputMode: 'microphone',
  mode: 'file',
  file: '',
  source: null,
  sourceLabel: '',
  duration: 0,
  loading: false,
  tags: null,
  error: null,
  microphoneDevices: [],
  selectedMicrophoneId: '',
  midiInputs: [],
  selectedMidiInputId: '',
  liveInputGain: 100,
  microphoneSupported: false,
  desktopAudioSupported: false,
  midiSupported: false,
};

export type AudioSourceErrorCode =
  /** The browser cannot capture this kind of input. */
  | 'unsupported'
  /** The person dismissed the screen-share picker. */
  | 'cancelled'
  /** The shared screen or window carries no audio. */
  | 'no-audio'
  | 'no-midi-inputs';

/** Why a source could not be connected, for callers that word it themselves. */
export class AudioSourceError extends Error {
  readonly code: AudioSourceErrorCode;

  constructor(code: AudioSourceErrorCode, message: string) {
    super(message);
    this.name = 'AudioSourceError';
    this.code = code;
  }
}

/** Where sound goes: the app's player and analyzer. */
export interface AudioOutput<A> {
  /** Resume the audio context if the browser suspended it. */
  resume(): Promise<void>;
  playFile(audio: A, label: string): void;
  playMicrophone(stream: MediaStream, label: string): void;
  playDesktopAudio(stream: MediaStream, label: string): void;
  playMidi(label: string): void;
  midiMessage(data: Uint8Array): void;
  /** Stop and release whatever is playing. */
  clear(): void;
  /** Live input gain as a factor (1 = unchanged). */
  setInputGain(gain: number): void;
}

/** The browser's capture APIs; a missing one means the browser lacks it. */
export interface AudioDevices {
  getUserMedia?(constraints: MediaStreamConstraints): Promise<MediaStream>;
  getDisplayMedia?(constraints: DisplayMediaStreamOptions): Promise<MediaStream>;
  enumerateDevices?(): Promise<MediaDeviceInfo[]>;
  requestMIDIAccess?(): Promise<MIDIAccess>;
}

export interface AudioSourceDeps<A> {
  output: AudioOutput<A>;
  devices: AudioDevices;
  decode(file: File): Promise<{ audio: A; duration: number }>;
  readTags(file: File): Promise<Record<string, unknown> | null>;
  transport: { play(): void; seek(time: number): void };
  /** The "play audio on load" preference. */
  playOnLoad(): boolean;
  /** Resolves after the next paint, so a loading indicator shows before heavy work. */
  nextPaint(): Promise<void>;
}

/**
 * The app's one audio source: a file, a microphone, desktop audio or a MIDI
 * input, switched between here and published as one state.
 *
 * Connecting throws an AudioSourceError, or the browser's error, when it
 * fails; the state then has no source. When a newer connect starts before an
 * older one finishes, the older one is abandoned and its stream released.
 */
export interface AudioSource {
  store: StoreApi<AudioState>;
  /**
   * Decode and play a file. A file that cannot be decoded leaves the current
   * source playing. `play` defaults to the "play audio on load" preference.
   */
  loadFile(file: File, options?: { play?: boolean }): Promise<void>;
  connectMicrophone(deviceId?: string): Promise<void>;
  connectDesktopAudio(): Promise<void>;
  connectMidi(inputId?: string): Promise<void>;
  /** Turn the live-input panel on (no source yet) or off (no source at all). */
  setLiveMode(enabled: boolean): void;
  setLiveInputMode(mode: LiveInputMode): void;
  /** Choose a microphone; reconnects when one is in use. */
  selectMicrophone(deviceId: string): void;
  /** Choose a MIDI input; reconnects when one is in use. */
  selectMidiInput(inputId: string): void;
  /** Live input gain in percent, clamped to 0–300. */
  setInputGain(percent: number): void;
  /** Look up the microphones, MIDI inputs and capture support the browser has now. */
  refreshInputs(): Promise<void>;
}

const NO_SOURCE = {
  file: '',
  source: null,
  sourceLabel: '',
  duration: 0,
  tags: null,
} satisfies Partial<AudioState>;

function microphoneOption(device: MediaDeviceInfo, index: number): InputOption {
  return {
    id: device.deviceId,
    label: device.label || t('audio.microphone-device', { count: index + 1 }),
  };
}

function midiLabel(input: MIDIInput) {
  return input.name || input.manufacturer || t('audio.midi-input');
}

function stopStream(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export function createAudioSource<A>(deps: AudioSourceDeps<A>): AudioSource {
  const { output, devices } = deps;
  const store = createStore<AudioState>(() => ({ ...initialAudioState }));
  const set = (partial: Partial<AudioState>) => store.setState(partial);

  let midiAccess: MIDIAccess | null = null;
  let activeMidiInput: MIDIInput | null = null;
  /** Bumped by every switch; an older connect that resolves later is abandoned. */
  let attempt = 0;

  function detachMidi() {
    if (activeMidiInput) {
      activeMidiInput.onmidimessage = null;
      activeMidiInput = null;
    }
  }

  /** Stop the current source, and say there is none. */
  function stop() {
    detachMidi();
    output.clear();
  }

  /** Start a switch: returns a check that is false once a newer one started. */
  function begin() {
    const mine = ++attempt;
    return () => mine === attempt;
  }

  function failed(mode: AudioMode) {
    set({ ...NO_SOURCE, mode, loading: false, error: null });
  }

  async function refreshMicrophones() {
    if (!devices.enumerateDevices) {
      set({ microphoneSupported: false, microphoneDevices: [], selectedMicrophoneId: '' });
      return;
    }

    const microphones = (await devices.enumerateDevices())
      .filter(device => device.kind === 'audioinput')
      .map(microphoneOption);
    const current = store.getState().selectedMicrophoneId;
    const selectedMicrophoneId = microphones.some(device => device.id === current)
      ? current
      : (microphones.find(device => device.id === 'default') ?? microphones[0])?.id || '';

    set({ microphoneSupported: true, microphoneDevices: microphones, selectedMicrophoneId });
  }

  function syncMidiInputs() {
    if (!devices.requestMIDIAccess) {
      set({ midiSupported: false, midiInputs: [], selectedMidiInputId: '' });
      return;
    }

    if (!midiAccess) {
      set({ midiSupported: true });
      return;
    }

    const inputs = [...midiAccess.inputs.values()].map(input => ({
      id: input.id,
      label: midiLabel(input),
    }));

    set({
      midiSupported: true,
      midiInputs: inputs,
      selectedMidiInputId:
        activeMidiInput?.id || store.getState().selectedMidiInputId || inputs[0]?.id || '',
    });
  }

  async function midi() {
    if (!devices.requestMIDIAccess) {
      throw new AudioSourceError('unsupported', t('errors.web-midi-unsupported'));
    }

    if (!midiAccess) {
      midiAccess = await devices.requestMIDIAccess();
      midiAccess.onstatechange = () => syncMidiInputs();
    }

    return midiAccess;
  }

  /** A live input is connected: publish it and start listening. */
  function live(mode: LiveInputMode, label: string, extra: Partial<AudioState> = {}) {
    output.setInputGain(store.getState().liveInputGain / 100);
    // Listening is playback: the transport starts it.
    deps.transport.play();
    set({
      ...NO_SOURCE,
      liveModeEnabled: true,
      liveInputMode: mode,
      mode,
      sourceLabel: label,
      loading: false,
      error: null,
      ...extra,
    });
  }

  function setLiveMode(enabled: boolean) {
    begin();
    stop();

    const { liveInputMode } = store.getState();
    set({
      ...NO_SOURCE,
      liveModeEnabled: enabled,
      mode: enabled ? liveInputMode : 'file',
      loading: false,
      error: null,
    });
  }

  const source: AudioSource = {
    store,

    async loadFile(file, options = {}) {
      const current = begin();
      set({ loading: true });
      await deps.nextPaint();

      let decoded: { audio: A; duration: number };

      try {
        decoded = await deps.decode(file);
      } catch (error) {
        // The current source keeps playing.
        if (current()) set({ loading: false });
        throw error;
      }

      if (!current()) return;

      detachMidi();
      output.playFile(decoded.audio, file.name);

      if (options.play ?? deps.playOnLoad()) {
        deps.transport.seek(0);
        deps.transport.play();
      }

      const tags = await deps.readTags(file).catch(() => null);
      if (!current()) return;

      set({
        liveModeEnabled: false,
        mode: 'file',
        file: file.name,
        source: file,
        sourceLabel: file.name,
        duration: decoded.duration,
        tags,
        loading: false,
        error: null,
      });
    },

    async connectMicrophone(deviceId) {
      if (!devices.getUserMedia) {
        throw new AudioSourceError('unsupported', 'Microphone capture is not supported.');
      }

      const current = begin();
      const requested = deviceId || store.getState().selectedMicrophoneId;
      set({ loading: true });
      stop();

      try {
        await output.resume();
        const stream = await devices.getUserMedia({
          audio: requested ? { deviceId: { exact: requested } } : true,
        });

        if (!current()) {
          stopStream(stream);
          return;
        }

        await refreshMicrophones();
        const [track] = stream.getAudioTracks();
        const label = track?.label || t('live-mode.microphone');

        output.playMicrophone(stream, label);
        live('microphone', label, {
          selectedMicrophoneId:
            track?.getSettings().deviceId || requested || store.getState().selectedMicrophoneId,
        });
      } catch (error) {
        if (current()) failed('microphone');
        throw error;
      }
    },

    async connectDesktopAudio() {
      if (!devices.getDisplayMedia) {
        throw new AudioSourceError('unsupported', 'Desktop audio capture is not supported.');
      }

      const current = begin();
      set({ loading: true });
      stop();

      try {
        await output.resume();

        let stream: MediaStream;
        try {
          stream = await devices.getDisplayMedia({
            video: true,
            audio: true,
            systemAudio: 'include',
          } as DisplayMediaStreamOptions);
        } catch (error) {
          if (error instanceof Error && error.name === 'NotAllowedError') {
            throw new AudioSourceError('cancelled', 'Desktop audio sharing was cancelled.');
          }
          throw error;
        }

        // Only the sound is wanted.
        for (const track of stream.getVideoTracks()) {
          track.stop();
        }

        if (!current()) {
          stopStream(stream);
          return;
        }

        const [track] = stream.getAudioTracks();

        if (!track) {
          stopStream(stream);
          throw new AudioSourceError('no-audio', 'The shared screen has no audio.');
        }

        // Sharing stopped from the browser's own controls.
        track.addEventListener('ended', () => {
          if (current()) setLiveMode(false);
        });

        const label = track.label || t('live-mode.desktop-audio');
        output.playDesktopAudio(stream, label);
        live('desktop', label);
      } catch (error) {
        // Whatever played before was stopped when the picker opened.
        if (current()) failed('desktop');
        throw error;
      }
    },

    async connectMidi(inputId) {
      const current = begin();
      const requested = inputId || store.getState().selectedMidiInputId;
      set({ loading: true });
      stop();

      try {
        const access = await midi();
        if (!current()) return;

        const inputs = [...access.inputs.values()];
        const input = inputs.find(item => item.id === requested) ?? inputs[0];
        syncMidiInputs();

        if (!input) {
          throw new AudioSourceError('no-midi-inputs', t('errors.no-midi-inputs-found'));
        }

        activeMidiInput = input;
        input.onmidimessage = event => {
          if (event.data) output.midiMessage(event.data);
        };

        const label = midiLabel(input);
        output.playMidi(label);
        live('midi', label, { selectedMidiInputId: input.id });
      } catch (error) {
        if (current()) failed('midi');
        throw error;
      }
    },

    setLiveMode,

    setLiveInputMode(mode) {
      begin();
      stop();
      set({ ...NO_SOURCE, liveInputMode: mode, mode, loading: false, error: null });
    },

    selectMicrophone(deviceId) {
      const state = store.getState();
      if (state.selectedMicrophoneId === deviceId) return;

      set({ selectedMicrophoneId: deviceId });

      if (state.mode === 'microphone' && state.sourceLabel) {
        void source.connectMicrophone(deviceId).catch(() => {});
      }
    },

    selectMidiInput(inputId) {
      const state = store.getState();
      if (state.selectedMidiInputId === inputId) return;

      set({ selectedMidiInputId: inputId });

      if (state.mode === 'midi' && state.sourceLabel) {
        void source.connectMidi(inputId).catch(() => {});
      }
    },

    setInputGain(percent) {
      const liveInputGain = Math.max(0, Math.min(300, percent));
      set({ liveInputGain });
      output.setInputGain(liveInputGain / 100);
    },

    async refreshInputs() {
      await refreshMicrophones();
      syncMidiInputs();
      set({ desktopAudioSupported: Boolean(devices.getDisplayMedia) });
    },
  };

  return source;
}

/** The status bar text for what is playing, or null while a source is connecting. */
export function audioStatusText(state: AudioState): string | null {
  if (state.loading) {
    return null;
  }

  if (state.liveModeEnabled) {
    if (state.sourceLabel) {
      return state.mode === 'midi'
        ? t('status.live-midi', { label: state.sourceLabel })
        : t('status.live', { label: state.sourceLabel });
    }

    return state.liveInputMode === 'microphone'
      ? t('status.input-mode-choose-microphone')
      : state.liveInputMode === 'desktop'
        ? t('status.input-mode-desktop-audio')
        : t('status.input-mode-choose-midi');
  }

  if (state.mode === 'file' && state.file) {
    const artist = typeof state.tags?.artist === 'string' ? state.tags.artist.trim() : '';
    const title = typeof state.tags?.title === 'string' ? state.tags.title.trim() : '';
    return [artist, title].filter(Boolean).join(' - ') || state.file;
  }

  return '';
}
