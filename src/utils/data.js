import zlib from 'zlib';
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

export function compress(data) {
    return new Promise((resolve, reject) => {
        zlib.gzip(
            data,
            (error, buffer) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(buffer);
                }
            },
        );
    });
}

export function decompress(data) {
    return new Promise((resolve, reject) => {
        zlib.unzip(
            data,
            (error, buffer) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(buffer);
                }
            },
        );
    });
}
