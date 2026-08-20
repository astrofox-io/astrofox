// @ts-nocheck

import { create } from 'zustand';
import { analyzer, api, audioContext, logger, player } from '@/app/global';
import { getPlayAudioOnLoad } from '@/app/preferences';
import { t } from '@/i18n/config';
import { loadAudioData } from '@/lib/utils/audio';
import { trimChars } from '@/lib/utils/string';
import appStore from './app';
import { raiseError } from './error';

export interface InputOption {
  id: string;
  label: string;
}

export interface AudioState {
  liveModeEnabled: boolean;
  liveInputMode: 'microphone' | 'midi' | 'desktop';
  mode: 'file' | 'microphone' | 'midi' | 'desktop';
  file: string;
  source: File | null;
  sourceLabel: string;
  duration: number;
  loading: boolean;
  tags: Record<string, unknown> | null;
  error: string | null;
  microphoneDevices: InputOption[];
  selectedMicrophoneId: string;
  midiInputs: InputOption[];
  selectedMidiInputId: string;
  liveInputGain: number;
  microphoneSupported: boolean;
  desktopAudioSupported: boolean;
  midiSupported: boolean;
}

export const initialState: AudioState = {
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

const audioStore = create<AudioState>(() => ({
  ...initialState,
}));

const AUDIO_FILE_EXTENSIONS = ['aac', 'flac', 'mp3', 'm4a', 'opus', 'ogg', 'wav'];
const DESKTOP_AUDIO_MISSING_ERROR = 'DESKTOP_AUDIO_MISSING';
const NO_MIDI_INPUTS_ERROR = 'NO_MIDI_INPUTS';

function getAudioFileFilters() {
  return [
    {
      name: t('file-types.audio-files'),
      extensions: AUDIO_FILE_EXTENSIONS,
    },
  ];
}

let midiAccess: MIDIAccess | null = null;
let activeMidiInput: MIDIInput | null = null;

function updateAudioState(
  partial: Partial<AudioState> & {
    mode?: 'file' | 'microphone' | 'midi' | 'desktop';
  },
) {
  audioStore.setState(partial);
}

function resetSourceState(mode: 'file' | 'microphone' | 'midi' | 'desktop') {
  updateAudioState({
    mode,
    file: '',
    source: null,
    sourceLabel: '',
    duration: 0,
    tags: null,
    loading: false,
    error: null,
  });
}

function getMicrophoneLabel(stream: MediaStream, fallback = t('live-mode.microphone')) {
  const [track] = stream.getAudioTracks();
  return track?.label || fallback;
}

function toDeviceOption(device: MediaDeviceInfo, index: number) {
  return {
    id: device.deviceId,
    label: device.label || t('audio.microphone-device', { count: index + 1 }),
  };
}

function getPreferredMicrophoneId(microphones: InputOption[], currentSelection: string) {
  if (microphones.some(device => device.id === currentSelection)) {
    return currentSelection;
  }

  const defaultDevice = microphones.find(device => device.id === 'default');

  return defaultDevice?.id || microphones[0]?.id || '';
}

function toMidiOption(input: MIDIInput) {
  return {
    id: input.id,
    label: input.name || input.manufacturer || t('audio.midi-input'),
  };
}

function detachMidiInput() {
  if (activeMidiInput) {
    activeMidiInput.onmidimessage = null;
    activeMidiInput = null;
  }
}

function clearLiveInputs() {
  detachMidiInput();
  player.clearSource();
}

function handleMidiMessage(event: MIDIMessageEvent) {
  player.handleMidiMessage({ data: event.data });
}

async function ensureMidiAccess() {
  if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
    throw new Error(t('errors.web-midi-unsupported'));
  }

  if (!midiAccess) {
    midiAccess = await navigator.requestMIDIAccess();
    midiAccess.onstatechange = () => {
      void syncMidiInputs();
    };
  }

  return midiAccess;
}

async function syncMidiInputs() {
  const supported =
    typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';

  if (!supported) {
    updateAudioState({
      midiSupported: false,
      midiInputs: [],
      selectedMidiInputId: '',
    });
    return [];
  }

  if (!midiAccess) {
    updateAudioState({
      midiSupported: true,
    });
    return audioStore.getState().midiInputs;
  }

  const inputs = Array.from(midiAccess.inputs.values()).map(toMidiOption);
  const selectedMidiInputId =
    activeMidiInput?.id || audioStore.getState().selectedMidiInputId || inputs[0]?.id || '';

  updateAudioState({
    midiSupported: true,
    midiInputs: inputs,
    selectedMidiInputId,
  });

  return inputs;
}

export async function inspectAudioFile(file: File) {
  const data = await api.readAudioFile(file);
  const audio = await loadAudioData(data);

  return {
    file,
    name: file.name,
    duration: audio.getDuration(),
    buffer: audio.buffer,
  };
}

export async function chooseAudioFile() {
  const { files, canceled } = await api.showOpenDialog({
    filters: getAudioFileFilters(),
  });

  if (canceled || !files?.length) {
    return null;
  }

  return files[0];
}

export async function refreshMicrophoneDevices() {
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.enumerateDevices;

  if (!supported) {
    updateAudioState({
      microphoneSupported: false,
      microphoneDevices: [],
      selectedMicrophoneId: '',
    });
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const microphones = devices.filter(device => device.kind === 'audioinput').map(toDeviceOption);
  const currentSelection = audioStore.getState().selectedMicrophoneId;
  const selectedMicrophoneId = getPreferredMicrophoneId(microphones, currentSelection);

  updateAudioState({
    microphoneSupported: true,
    microphoneDevices: microphones,
    selectedMicrophoneId,
  });

  return microphones;
}

export async function refreshInputOptions() {
  await refreshMicrophoneDevices();
  await syncMidiInputs();

  const desktopAudioSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

  updateAudioState({ desktopAudioSupported });
}

export function selectMicrophoneDevice(deviceId: string) {
  if (audioStore.getState().selectedMicrophoneId === deviceId) {
    return;
  }

  updateAudioState({ selectedMicrophoneId: deviceId });

  if (player.getMode() === 'microphone' && player.hasSource()) {
    void connectMicrophone(deviceId);
  }
}

export function selectMidiInput(inputId: string) {
  if (audioStore.getState().selectedMidiInputId === inputId) {
    return;
  }

  updateAudioState({ selectedMidiInputId: inputId });

  if (player.getMode() === 'midi' && player.hasSource()) {
    void connectMidiInput(inputId);
  }
}

export function setLiveInputGain(value: number) {
  const liveInputGain = Math.max(0, Math.min(300, value));

  updateAudioState({ liveInputGain });
  player.setInputGain(liveInputGain / 100);
}

export async function loadAudioFile(file: File | string, play?: boolean) {
  updateAudioState({ loading: true, liveModeEnabled: false, mode: 'file' });
  clearLiveInputs();

  // Yield one frame so loading UI can paint before heavy audio decode work begins.
  await new Promise(resolve => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(() => resolve(), 0);
  });

  const name = file?.name || file;

  logger.time('audio-file-load');

  try {
    const data = await api.readAudioFile(file);
    const audio = await loadAudioData(data);
    const duration = audio.getDuration();

    player.load(audio, name);
    audio.addNode(analyzer.analyzer);

    const shouldPlay = play ?? getPlayAudioOnLoad();

    if (shouldPlay) {
      player.play();
    }

    logger.timeEnd('audio-file-load', 'Audio file loaded:', name);

    const tags = await api.loadAudioTags(file);
    const artist = typeof tags?.artist === 'string' ? tags.artist.trim() : '';
    const title = typeof tags?.title === 'string' ? tags.title.trim() : '';
    const metadataLabel = [artist, title].filter(Boolean).join(' - ');

    appStore.setState({ statusText: trimChars(metadataLabel || name) });

    updateAudioState({
      liveModeEnabled: false,
      mode: 'file',
      file: name,
      source: file instanceof File ? file : null,
      sourceLabel: name,
      duration,
      tags,
      loading: false,
    });
  } catch (error) {
    raiseError(t('errors.invalid-audio-file'), error);
    updateAudioState({ loading: false });
  }
}

export async function connectMicrophone(deviceId?: string) {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    raiseError(t('errors.microphone-unsupported'));
    return false;
  }

  const selectedDeviceId = deviceId || audioStore.getState().selectedMicrophoneId;

  updateAudioState({ loading: true });
  detachMidiInput();
  player.clearSource();

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: selectedDeviceId
        ? {
            deviceId: {
              exact: selectedDeviceId,
            },
          }
        : true,
    });
    await refreshMicrophoneDevices();

    const label = getMicrophoneLabel(stream);
    // biome-ignore lint/correctness/useHookAtTopLevel: This is an imperative player method, not a React hook.
    player.useMicrophone(stream, analyzer.analyzer, label);
    player.setInputGain(audioStore.getState().liveInputGain / 100);

    appStore.setState({
      statusText: trimChars(t('status.live', { label })),
    });

    updateAudioState({
      liveModeEnabled: true,
      liveInputMode: 'microphone',
      mode: 'microphone',
      file: '',
      source: null,
      sourceLabel: label,
      duration: 0,
      tags: null,
      loading: false,
      selectedMicrophoneId:
        stream.getAudioTracks()[0]?.getSettings().deviceId ||
        selectedDeviceId ||
        audioStore.getState().selectedMicrophoneId ||
        '',
    });

    return true;
  } catch (error) {
    raiseError(t('errors.microphone-access-failed'), error);
    resetSourceState('microphone');
    return false;
  }
}

export async function connectDesktopAudio() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    raiseError(t('errors.desktop-audio-unsupported'));
    return false;
  }

  updateAudioState({ loading: true });
  detachMidiInput();
  player.clearSource();

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
      systemAudio: 'include',
    });

    for (const track of stream.getVideoTracks()) {
      track.stop();
    }

    if (stream.getAudioTracks().length === 0) {
      throw new Error(DESKTOP_AUDIO_MISSING_ERROR);
    }

    stream.getAudioTracks()[0].addEventListener('ended', () => {
      setLiveModeEnabled(false);
    });

    const label = stream.getAudioTracks()[0]?.label || t('live-mode.desktop-audio');
    // biome-ignore lint/correctness/useHookAtTopLevel: This is an imperative player method, not a React hook.
    player.useDesktopAudio(stream, analyzer.analyzer, label);
    player.setInputGain(audioStore.getState().liveInputGain / 100);

    appStore.setState({
      statusText: trimChars(t('status.live', { label })),
    });

    updateAudioState({
      liveModeEnabled: true,
      liveInputMode: 'desktop',
      mode: 'desktop',
      file: '',
      source: null,
      sourceLabel: label,
      duration: 0,
      tags: null,
      loading: false,
    });

    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'NotAllowedError') {
      updateAudioState({ loading: false });
      return false;
    }

    if (error instanceof Error && error.message === DESKTOP_AUDIO_MISSING_ERROR) {
      raiseError(t('errors.desktop-audio-missing'), undefined, {
        logLevel: 'warn',
      });
      resetSourceState('desktop');
      return false;
    }

    raiseError(t('errors.desktop-audio-capture-failed'), error);
    resetSourceState('desktop');
    return false;
  }
}

export async function connectMidiInput(inputId?: string) {
  const selectedInputId = inputId || audioStore.getState().selectedMidiInputId;

  updateAudioState({ loading: true });
  player.clearSource();
  detachMidiInput();

  try {
    const access = await ensureMidiAccess();
    const inputs = Array.from(access.inputs.values());
    const targetInput = inputs.find(input => input.id === selectedInputId) || inputs[0] || null;

    await syncMidiInputs();

    if (!targetInput) {
      throw new Error(NO_MIDI_INPUTS_ERROR);
    }

    activeMidiInput = targetInput;
    activeMidiInput.onmidimessage = handleMidiMessage;

    const label = targetInput.name || targetInput.manufacturer || t('audio.midi-input');
    // biome-ignore lint/correctness/useHookAtTopLevel: This is an imperative player method, not a React hook.
    player.useMidi(label);

    appStore.setState({
      statusText: trimChars(t('status.live-midi', { label })),
    });

    updateAudioState({
      liveModeEnabled: true,
      liveInputMode: 'midi',
      mode: 'midi',
      file: '',
      source: null,
      sourceLabel: label,
      duration: 0,
      tags: null,
      loading: false,
      selectedMidiInputId: targetInput.id,
    });

    return true;
  } catch (error) {
    const expectedMissingInput = error instanceof Error && error.message === NO_MIDI_INPUTS_ERROR;

    raiseError(
      t('errors.midi-connect-failed'),
      expectedMissingInput ? new Error(t('errors.no-midi-inputs-found')) : error,
      {
        logLevel: expectedMissingInput ? 'warn' : 'error',
      },
    );
    resetSourceState('midi');
    return false;
  }
}

export function setLiveInputMode(mode: 'microphone' | 'midi' | 'desktop') {
  updateAudioState({
    liveInputMode: mode,
    mode,
    file: '',
    source: null,
    sourceLabel: '',
    duration: 0,
    tags: null,
    error: null,
  });
  player.clearSource();
}

export function setLiveModeEnabled(enabled: boolean) {
  if (!enabled) {
    clearLiveInputs();
    resetSourceState('file');
    updateAudioState({ liveModeEnabled: false, mode: 'file' });
    appStore.setState({ statusText: '' });
    return;
  }

  const { liveInputMode } = audioStore.getState();
  clearLiveInputs();
  resetSourceState(liveInputMode);
  updateAudioState({
    liveModeEnabled: true,
    mode: liveInputMode,
  });
  appStore.setState({
    statusText:
      liveInputMode === 'microphone'
        ? t('status.input-mode-choose-microphone')
        : liveInputMode === 'desktop'
          ? t('status.input-mode-desktop-audio')
          : t('status.input-mode-choose-midi'),
  });
}

export async function openAudioFile(play?: boolean) {
  const { files, canceled } = await api.showOpenDialog({
    filters: getAudioFileFilters(),
  });

  if (!canceled && files && files.length) {
    await loadAudioFile(files[0], play);
  }
}

export default audioStore;
