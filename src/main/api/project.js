import path from 'path';
import { readFile, readFileCompressed, writeFileCompressed } from 'utils/io';

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
