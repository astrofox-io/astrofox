import Audio from 'audio/Audio';
import { audioContext } from 'view/global';

export function loadAudioData(data) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioContext);

    return audio
      .load(data)
      .then(() => {
        resolve(audio);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function downmix(input) {
  const { length, numberOfChannels } = input;
  const output = new Float32Array(length);

  if (numberOfChannels < 2) {
    return input.slice();
  }

  for (let i = 0; i < numberOfChannels; i++) {
    const ch = input.getChannelData(i);

    for (let j = 0; j < length; j++) {
      output[j] += ch[j];
    }
  }

  return output.map(x => x / numberOfChannels);
}
