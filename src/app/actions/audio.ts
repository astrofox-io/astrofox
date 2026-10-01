import { useStore } from 'zustand';
import { analyzer, api, audioContext, logger, player } from '@/app/global';
import { getPlayAudioOnLoad } from '@/app/preferences';
import { t } from '@/i18n/config';
import type Audio from '@/lib/audio/Audio';
import {
  type AudioSource,
  AudioSourceError,
  type AudioSourceErrorCode,
  type AudioState,
  audioStatusText,
  createAudioSource,
  type LiveInputMode,
} from '@/lib/audio/audioSource';
import { playTransport, seekTransport } from '@/lib/timeline/transport';
import { loadAudioData } from '@/lib/utils/audio';
import { trimChars } from '@/lib/utils/string';
import appStore from './app';
import { raiseError } from './error';

export type { AudioState, InputOption } from '@/lib/audio/audioSource';

const AUDIO_FILE_EXTENSIONS = ['aac', 'flac', 'mp3', 'm4a', 'opus', 'ogg', 'wav'];

const navigatorDevices = typeof navigator === 'undefined' ? undefined : navigator;
const mediaDevices = navigatorDevices?.mediaDevices;

/** The app's audio source: the player, fed by a file or a live input. */
export const audioSource: AudioSource = createAudioSource<Audio>({
  output: {
    async resume() {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
    },
    playFile(audio, label) {
      player.load(audio, label);
      audio.addNode(analyzer.analyzer);
    },
    playMicrophone: (stream, label) => player.useMicrophone(stream, analyzer.analyzer, label),
    playDesktopAudio: (stream, label) => player.useDesktopAudio(stream, analyzer.analyzer, label),
    playMidi: label => player.useMidi(label),
    midiMessage: data => player.handleMidiMessage({ data }),
    clear: () => player.clearSource(),
    setInputGain: gain => player.setInputGain(gain),
  },
  devices: {
    getUserMedia: mediaDevices?.getUserMedia?.bind(mediaDevices),
    getDisplayMedia: mediaDevices?.getDisplayMedia?.bind(mediaDevices),
    enumerateDevices: mediaDevices?.enumerateDevices?.bind(mediaDevices),
    requestMIDIAccess: navigatorDevices?.requestMIDIAccess?.bind(navigatorDevices),
  },
  async decode(file) {
    const audio = await loadAudioData((await api.readAudioFile(file)) as ArrayBuffer);
    return { audio, duration: audio.getDuration() };
  },
  readTags: file => api.loadAudioTags(file),
  transport: { play: playTransport, seek: seekTransport },
  playOnLoad: getPlayAudioOnLoad,
  nextPaint: () =>
    new Promise(resolve => {
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    }),
});

/** The audio state for React (`useAudioStore(selector)`), and `getState()` for everyone else. */
const useAudioStore = Object.assign(
  <T>(selector: (state: AudioState) => T): T => useStore(audioSource.store, selector),
  audioSource.store,
);

// The status bar says what is playing, whenever that changes (and only then,
// so an export's progress is not overwritten by a gain change).
let shownStatus = '';
audioSource.store.subscribe(state => {
  const text = audioStatusText(state);
  if (text !== null && text !== shownStatus) {
    shownStatus = text;
    appStore.setState({ statusText: trimChars(text) });
  }
});

/** Report a failed connect, worded for its cause. Resolves false. */
function report(
  error: unknown,
  messages: Partial<Record<AudioSourceErrorCode | 'default', string>>,
) {
  const code = error instanceof AudioSourceError ? error.code : 'default';

  // Dismissing the screen-share picker is not a failure.
  if (code === 'cancelled') {
    return false;
  }

  raiseError(t(messages[code] ?? (messages.default as string)), error, {
    logLevel: code === 'no-audio' || code === 'no-midi-inputs' ? 'warn' : 'error',
  });
  return false;
}

export async function inspectAudioFile(file: File) {
  const audio = await loadAudioData((await api.readAudioFile(file)) as ArrayBuffer);

  return {
    file,
    name: file.name,
    duration: audio.getDuration(),
    buffer: audio.buffer,
  };
}

export async function chooseAudioFile() {
  const { files, canceled } = await api.showOpenDialog({
    filters: [{ name: t('file-types.audio-files'), extensions: AUDIO_FILE_EXTENSIONS }],
  });

  return canceled || !files?.length ? null : files[0];
}

/** Load and play an audio file, reporting a file that cannot be read. Resolves whether it loaded. */
export async function loadAudioFile(file: File, play?: boolean) {
  try {
    await audioSource.loadFile(file, { play });
    logger.log('Audio file loaded:', file.name);
    return true;
  } catch (error) {
    return report(error, { default: 'errors.invalid-audio-file' });
  }
}

export async function openAudioFile(play?: boolean) {
  const file = await chooseAudioFile();

  if (file) {
    await loadAudioFile(file, play);
  }
}

export async function connectMicrophone(deviceId?: string) {
  try {
    await audioSource.connectMicrophone(deviceId);
    return true;
  } catch (error) {
    return report(error, {
      unsupported: 'errors.microphone-unsupported',
      default: 'errors.microphone-access-failed',
    });
  }
}

export async function connectDesktopAudio() {
  try {
    await audioSource.connectDesktopAudio();
    return true;
  } catch (error) {
    return report(error, {
      unsupported: 'errors.desktop-audio-unsupported',
      'no-audio': 'errors.desktop-audio-missing',
      default: 'errors.desktop-audio-capture-failed',
    });
  }
}

export async function connectMidiInput(inputId?: string) {
  try {
    await audioSource.connectMidi(inputId);
    return true;
  } catch (error) {
    return report(error, { default: 'errors.midi-connect-failed' });
  }
}

export function setLiveModeEnabled(enabled: boolean) {
  audioSource.setLiveMode(enabled);
}

export function setLiveInputMode(mode: LiveInputMode) {
  audioSource.setLiveInputMode(mode);
}

export function selectMicrophoneDevice(deviceId: string) {
  audioSource.selectMicrophone(deviceId);
}

export function selectMidiInput(inputId: string) {
  audioSource.selectMidiInput(inputId);
}

export function setLiveInputGain(value: number) {
  audioSource.setInputGain(value);
}

export function refreshInputOptions() {
  return audioSource.refreshInputs();
}

export default useAudioStore;
