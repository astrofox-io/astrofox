import * as id3 from 'id3js';

export async function loadAudioTags(file) {
  try {
    return await id3.fromPath(file);
  } catch (e) {
    return null;
  }
}
