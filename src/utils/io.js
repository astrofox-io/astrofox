import fs from 'fs';
import mime from 'mime';
import { compress, decompress } from './data';

export function readFile(file) {
  return new Promise((resolve, reject) => {
    try {
      resolve(fs.readFileSync(file));
    } catch (err) {
      reject(err);
    }
  });
}

export async function readFileCompressed(file) {
  const data = await readFile(file);
  return decompress(data);
}

export async function readFileAsBlob(file) {
  const data = await readFile(file);
  return new Blob([new Uint8Array(data).buffer], { type: mime.getType(file) });
}

export function readAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      resolve(e.target.result);
    };

    reader.onerror = e => {
      reject(e.target.error);
    };

    return reader.readAsArrayBuffer(blob);
  });
}

export function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      resolve(e.target.result);
    };

    reader.onerror = e => {
      reject(e.target.error);
    };

    reader.readAsDataURL(blob);
  });
}

export function writeFile(file, data) {
  return new Promise((resolve, reject) => {
    try {
      resolve(fs.writeFileSync(file, data));
    } catch (err) {
      reject(err);
    }
  });
}

export async function writeFileCompressed(file, data) {
  const buffer = await compress(data);
  return writeFile(file, buffer);
}

export function removeFile(file) {
  return new Promise((resolve, reject) => {
    try {
      resolve(fs.unlinkSync(file));
    } catch (err) {
      reject(err);
    }
  });
}

export function createFolder(path) {
  return new Promise((resolve, reject) => {
    try {
      resolve(fs.mkdirSync(path));
    } catch (err) {
      if (err.code === 'EEXIST') resolve();

      reject(err);
    }
  });
}

export function fileExists(file) {
  return fs.existsSync(file);
}
