import path from 'path';
import { readFile, writeFile } from 'utils/io';
import { blobToDataUrl, dataToBlob } from 'utils/data';

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
