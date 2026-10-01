/** Bytes from the app window as a Buffer, without copying them. */
export function toBuffer(data: Uint8Array | ArrayBuffer | string): Buffer {
  if (typeof data === 'string') {
    return Buffer.from(data, 'utf8');
  }

  if (Buffer.isBuffer(data)) {
    return data;
  }

  return data instanceof ArrayBuffer
    ? Buffer.from(data)
    : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}
