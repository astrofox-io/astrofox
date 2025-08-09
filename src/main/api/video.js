import path from 'path';
import { readFile } from 'utils/io';
import { blobToDataUrl, dataToBlob } from 'utils/data';

export async function readVideoFile(file) {
  const fileData = await readFile(file);
  const blob = await dataToBlob(fileData, path.extname(file));

  if (!/^video/.test(blob.type)) {
    throw new Error('Invalid video file.');
  }

  return blobToDataUrl(blob);
}
