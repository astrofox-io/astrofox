import mime from 'mime';

export function blobToDataUrl(blob) {
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

export function blobToArrayBuffer(blob) {
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

export async function dataToBlob(data, ext) {
  return new Blob([new Uint8Array(data).buffer], { type: mime.getType(ext) });
}

export function streamToBuffer(stream) {
  const chunks = [];

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
