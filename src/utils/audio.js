import * as id3 from 'id3js';
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

export function loadAudioTags(file) {
  return id3.fromPath(file);
}
