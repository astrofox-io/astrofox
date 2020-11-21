import path from 'path';
import * as id3 from 'id3js';
import { readFile } from 'utils/io';
import { blobToArrayBuffer, dataToBlob } from 'utils/data';
import { log } from './ipc';

export async function readAudioFile(file) {
  const fileData = await readFile(file);
  const blob = await dataToBlob(fileData, path.extname(file));

  let { type } = blob;

  // mime module does not recognize opus
  if (file.endsWith('.opus')) {
    type = 'audio/opus';
  }

  if (!/^audio/.test(type)) {
    throw new Error(`Unrecognized audio type: ${type}`);
  }

  return blobToArrayBuffer(blob);
}

export async function loadAudioTags(file) {
  try {
    return await id3.fromPath(file);
  } catch (e) {
    log(e);
    return null;
  }
}
