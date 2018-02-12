import { Buffer as NodeBuffer } from 'buffer';

export function toArrayBuffer(buffer) {
    const ab = new ArrayBuffer(buffer.length);
    const b = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i) {
        b[i] = buffer[i];
    }

    return ab;
}

export function toBuffer(ab) {
    const buffer = new NodeBuffer(ab.byteLength);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }

    return buffer;
}
