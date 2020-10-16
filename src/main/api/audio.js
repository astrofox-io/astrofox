import * as id3 from 'id3js';
import { log } from './ipc';

export async function loadAudioTags(file) {
  try {
    return await id3.fromPath(file);
  } catch (e) {
    log(e);
    return null;
  }
}
