import fs from 'fs';
import zlib from 'zlib';

export function compress(data) {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    });
  });
}

export function decompress(data) {
  return new Promise((resolve, reject) => {
    zlib.unzip(data, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    });
  });
}

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
