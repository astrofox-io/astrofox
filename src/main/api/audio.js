import * as id3 from 'id3js';

export function loadAudioTags(file) {
  return id3.fromPath(file);
}
