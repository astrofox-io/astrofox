import path from 'path';
import { readFile, readFileCompressed, writeFile, writeFileCompressed } from 'utils/io';
import { blobToArrayBuffer, blobToDataUrl, dataToBlob } from 'utils/data';

export async function loadProjectFile(file) {
  try {
    const data = await readFileCompressed(file);

    return JSON.parse(data);
  } catch (error) {
    if (error.message.indexOf('incorrect header check') > -1) {
      const data = readFile(file);

      return JSON.parse(data);
    }
  }
}

export async function saveProjectFile(file, data) {
  if (path.extname(file) === '.afx') {
    return writeFileCompressed(file, JSON.stringify(data));
  }
}

export async function saveImageFile(file, data) {
  if (['.jpg', '.png', '.gif'].includes(path.extname(file))) {
    return writeFile(file, data);
  }
}

export async function readImageFile(file) {
  const fileData = await readFile(file);
  const blob = await dataToBlob(fileData, path.extname(file));

  if (!/^image/.test(blob.type)) {
    throw new Error('Invalid image file.');
  }

  return blobToDataUrl(blob);
}

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
