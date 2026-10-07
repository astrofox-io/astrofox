import Audio from '@/lib/audio/Audio';

export async function loadAudioData(data: string | ArrayBuffer): Promise<Audio> {
  // SpectrumAnalyzer imports downmix from this module during app startup.
  // Resolve the shared context only when loading audio to avoid a cycle back
  // through app/global while the analyzer class is still initializing.
  const { audioContext } = await import('@/app/global');
  const audio = new Audio(audioContext);
  await audio.load(data);
  return audio;
}

export function downmix(input: AudioBuffer) {
  const { length, numberOfChannels } = input;
  const output = new Float32Array(length);

  if (numberOfChannels < 2) {
    return input.getChannelData(0);
  }

  for (let i = 0; i < numberOfChannels; i++) {
    const ch = input.getChannelData(i);

    for (let j = 0; j < length; j++) {
      output[j] += ch[j];
    }
  }

  return output.map(x => x / numberOfChannels);
}
