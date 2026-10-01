import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AudioDevices,
  type AudioSource,
  AudioSourceError,
  type AudioSourceErrorCode,
  audioStatusText,
  createAudioSource,
  initialAudioState,
} from './audioSource';

type Decoded = { name: string };

let log: string[];
let devices: AudioDevices;
let decode: (file: File) => Promise<{ audio: Decoded; duration: number }>;
let playOnLoad: boolean;
let source: AudioSource;

/** A promise settled from the outside, to hold a step open. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function track(kind: 'audio' | 'video', label = '', deviceId = '') {
  const listeners: Record<string, () => void> = {};
  return {
    kind,
    label,
    stop: vi.fn(),
    getSettings: () => ({ deviceId }),
    addEventListener: (type: string, listener: () => void) => {
      listeners[type] = listener;
    },
    fire: (type: string) => listeners[type]?.(),
  };
}

function stream(...tracks: ReturnType<typeof track>[]) {
  return {
    getTracks: () => tracks,
    getAudioTracks: () => tracks.filter(item => item.kind === 'audio'),
    getVideoTracks: () => tracks.filter(item => item.kind === 'video'),
  } as unknown as MediaStream;
}

function midiInput(id: string, name: string) {
  return { id, name, manufacturer: '', onmidimessage: null } as unknown as MIDIInput & {
    onmidimessage: ((event: { data: Uint8Array }) => void) | null;
  };
}

function midiAccess(...inputs: MIDIInput[]) {
  return { inputs: new Map(inputs.map(input => [input.id, input])), onstatechange: null };
}

function file(name: string) {
  return new File(['bytes'], name);
}

async function failure(work: Promise<unknown>): Promise<AudioSourceErrorCode | string> {
  try {
    await work;
  } catch (error) {
    return error instanceof AudioSourceError ? error.code : String(error);
  }
  throw new Error('Expected it to fail.');
}

function state() {
  return source.store.getState();
}

function create() {
  source = createAudioSource<Decoded>({
    output: {
      resume: async () => {
        log.push('resume');
      },
      playFile: (audio, label) => log.push(`file ${audio.name} as ${label}`),
      playMicrophone: (_stream, label) => log.push(`microphone ${label}`),
      playDesktopAudio: (_stream, label) => log.push(`desktop ${label}`),
      playMidi: label => log.push(`midi ${label}`),
      midiMessage: data => log.push(`midi message ${[...data].join(',')}`),
      clear: () => log.push('clear'),
      setInputGain: gain => log.push(`gain ${gain}`),
    },
    devices,
    decode: input => decode(input),
    readTags: async () => ({ artist: 'Artist', title: 'Song' }),
    transport: {
      play: () => log.push('play'),
      seek: time => log.push(`seek ${time}`),
    },
    playOnLoad: () => playOnLoad,
    nextPaint: async () => {},
  });
}

beforeEach(() => {
  log = [];
  devices = {};
  playOnLoad = false;
  decode = async input => ({ audio: { name: input.name }, duration: 42 });
  create();
});

describe('loadFile', () => {
  it('plays the file and publishes it', async () => {
    const song = file('song.mp3');

    await source.loadFile(song);

    expect(log).toEqual(['file song.mp3 as song.mp3']);
    expect(state()).toMatchObject({
      mode: 'file',
      file: 'song.mp3',
      source: song,
      sourceLabel: 'song.mp3',
      duration: 42,
      tags: { artist: 'Artist', title: 'Song' },
      loading: false,
      liveModeEnabled: false,
    });
  });

  it('starts from the beginning when asked to play, or by preference', async () => {
    await source.loadFile(file('a.mp3'), { play: true });
    expect(log.slice(-2)).toEqual(['seek 0', 'play']);

    log = [];
    playOnLoad = true;
    await source.loadFile(file('b.mp3'));
    expect(log).toContain('play');

    log = [];
    await source.loadFile(file('c.mp3'), { play: false });
    expect(log).not.toContain('play');
  });

  it('keeps the current audio playing when the new file cannot be decoded', async () => {
    await source.loadFile(file('good.mp3'));
    log = [];
    decode = async () => {
      throw new Error('Unable to decode audio data');
    };

    await expect(source.loadFile(file('bad.txt'))).rejects.toThrow('Unable to decode');

    expect(log).toEqual([]);
    expect(state()).toMatchObject({ file: 'good.mp3', loading: false });
  });

  it('plays the newest file when an older one finishes decoding later', async () => {
    const slow = deferred<{ audio: Decoded; duration: number }>();
    decode = async input =>
      input.name === 'slow.mp3' ? slow.promise : { audio: { name: input.name }, duration: 1 };

    const first = source.loadFile(file('slow.mp3'));
    await source.loadFile(file('fast.mp3'));
    slow.resolve({ audio: { name: 'slow.mp3' }, duration: 99 });
    await first;

    expect(log).toEqual(['file fast.mp3 as fast.mp3']);
    expect(state().file).toBe('fast.mp3');
  });
});

describe('connectMicrophone', () => {
  it('needs the browser to support it, and changes nothing otherwise', async () => {
    expect(await failure(source.connectMicrophone())).toBe('unsupported');
    expect(state()).toEqual(initialAudioState);
  });

  it('listens to the chosen microphone at the live gain', async () => {
    const getUserMedia = vi.fn(async () => stream(track('audio', 'USB Mic', 'usb')));
    devices = { getUserMedia };
    create();
    source.setInputGain(150);
    log = [];

    await source.connectMicrophone('usb');

    expect(getUserMedia).toHaveBeenCalledWith({ audio: { deviceId: { exact: 'usb' } } });
    expect(log).toEqual(['clear', 'resume', 'microphone USB Mic', 'gain 1.5', 'play']);
    expect(state()).toMatchObject({
      liveModeEnabled: true,
      liveInputMode: 'microphone',
      mode: 'microphone',
      sourceLabel: 'USB Mic',
      selectedMicrophoneId: 'usb',
      loading: false,
    });
  });

  it('leaves no source when access is denied', async () => {
    devices = {
      getUserMedia: async () => {
        throw Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' });
      },
    };
    create();
    await source.loadFile(file('song.mp3'));

    await expect(source.connectMicrophone()).rejects.toThrow('Permission denied');

    expect(state()).toMatchObject({
      mode: 'microphone',
      file: '',
      sourceLabel: '',
      loading: false,
    });
  });

  it('releases a microphone that was granted after the person moved on', async () => {
    const granted = deferred<MediaStream>();
    const mic = track('audio', 'Mic');
    devices = { getUserMedia: () => granted.promise };
    create();

    const connecting = source.connectMicrophone();
    source.setLiveMode(false);
    granted.resolve(stream(mic));
    await connecting;

    expect(mic.stop).toHaveBeenCalled();
    expect(log).not.toContain('microphone Mic');
    expect(state().liveModeEnabled).toBe(false);
  });

  it('reconnects when another microphone is chosen while one is in use', async () => {
    const getUserMedia = vi.fn(async () => stream(track('audio', 'Mic')));
    devices = { getUserMedia };
    create();
    await source.connectMicrophone('a');

    source.selectMicrophone('b');
    await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2));

    expect(getUserMedia).toHaveBeenLastCalledWith({ audio: { deviceId: { exact: 'b' } } });
  });
});

describe('connectDesktopAudio', () => {
  it('keeps only the sound of the shared screen', async () => {
    const video = track('video');
    devices = { getDisplayMedia: async () => stream(video, track('audio', 'System audio')) };
    create();

    await source.connectDesktopAudio();

    expect(video.stop).toHaveBeenCalled();
    expect(state()).toMatchObject({ mode: 'desktop', sourceLabel: 'System audio' });
  });

  it('reports a dismissed picker as cancelled', async () => {
    devices = {
      getDisplayMedia: async () => {
        throw Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' });
      },
    };
    create();

    expect(await failure(source.connectDesktopAudio())).toBe('cancelled');
    expect(state().loading).toBe(false);
  });

  it('refuses a share without audio', async () => {
    const video = track('video');
    devices = { getDisplayMedia: async () => stream(video) };
    create();

    expect(await failure(source.connectDesktopAudio())).toBe('no-audio');
    expect(state()).toMatchObject({ mode: 'desktop', sourceLabel: '' });
  });

  it('turns live mode off when sharing is stopped from the browser', async () => {
    const audio = track('audio', 'System audio');
    devices = { getDisplayMedia: async () => stream(audio) };
    create();
    await source.connectDesktopAudio();

    audio.fire('ended');

    expect(state()).toMatchObject({ liveModeEnabled: false, mode: 'file', sourceLabel: '' });
  });
});

describe('connectMidi', () => {
  it('listens to the first input when none was chosen, and forwards its messages', async () => {
    const keys = midiInput('k', 'Keys');
    devices = { requestMIDIAccess: async () => midiAccess(keys) as unknown as MIDIAccess };
    create();

    await source.connectMidi();
    keys.onmidimessage?.({ data: new Uint8Array([144, 60, 100]) });

    expect(log).toContain('midi Keys');
    expect(log).toContain('midi message 144,60,100');
    expect(state()).toMatchObject({
      mode: 'midi',
      sourceLabel: 'Keys',
      selectedMidiInputId: 'k',
      midiInputs: [{ id: 'k', label: 'Keys' }],
    });
  });

  it('stops listening to the input when another source is chosen', async () => {
    const keys = midiInput('k', 'Keys');
    devices = { requestMIDIAccess: async () => midiAccess(keys) as unknown as MIDIAccess };
    create();
    await source.connectMidi();

    await source.loadFile(file('song.mp3'));

    expect(keys.onmidimessage).toBeNull();
  });

  it('needs an input to listen to', async () => {
    devices = { requestMIDIAccess: async () => midiAccess() as unknown as MIDIAccess };
    create();

    expect(await failure(source.connectMidi())).toBe('no-midi-inputs');
    expect(state()).toMatchObject({ mode: 'midi', sourceLabel: '', loading: false });
  });

  it('needs the browser to support MIDI', async () => {
    expect(await failure(source.connectMidi())).toBe('unsupported');
  });
});

describe('live mode', () => {
  it('stops the source and waits for an input to be chosen', async () => {
    await source.loadFile(file('song.mp3'));
    source.setLiveInputMode('desktop');
    log = [];

    source.setLiveMode(true);

    expect(log).toEqual(['clear']);
    expect(state()).toMatchObject({ liveModeEnabled: true, mode: 'desktop', sourceLabel: '' });
  });
});

describe('inputs', () => {
  it('clamps the live gain to 0–300 percent', () => {
    source.setInputGain(500);
    expect(state().liveInputGain).toBe(300);
    source.setInputGain(-5);
    expect(state().liveInputGain).toBe(0);
  });

  it('lists the microphones, choosing the default one', async () => {
    devices = {
      enumerateDevices: async () =>
        [
          { kind: 'videoinput', deviceId: 'cam', label: 'Camera' },
          { kind: 'audioinput', deviceId: 'usb', label: 'USB Mic' },
          { kind: 'audioinput', deviceId: 'default', label: '' },
        ] as MediaDeviceInfo[],
      getDisplayMedia: async () => stream(),
    };
    create();

    await source.refreshInputs();

    expect(state().microphoneDevices.map(device => device.id)).toEqual(['usb', 'default']);
    expect(state()).toMatchObject({
      selectedMicrophoneId: 'default',
      microphoneSupported: true,
      desktopAudioSupported: true,
      midiSupported: false,
    });
  });
});

describe('audioStatusText', () => {
  it('names the song from its tags, or the file', () => {
    const file = { ...initialAudioState, mode: 'file' as const, file: 'song.mp3' };

    expect(audioStatusText(file)).toBe('song.mp3');
    expect(audioStatusText({ ...file, tags: { artist: 'Artist', title: 'Song' } })).toBe(
      'Artist - Song',
    );
  });

  it('says nothing while a source is connecting', () => {
    expect(audioStatusText({ ...initialAudioState, loading: true })).toBeNull();
  });

  it('is empty without a source', () => {
    expect(audioStatusText(initialAudioState)).toBe('');
  });
});
