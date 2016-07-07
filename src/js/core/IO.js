'use strict';

const Buffer = window.require('buffer').Buffer;
const fs = window.require('fs');
const spawn = window.require('child_process').spawn;
const stream = window.require('stream');
const zlib = window.require('zlib');
const mime = require('mime');

const IO = {
    Buffer: Buffer,
    fs: fs,
    Spawn: spawn,
    Stream: stream,
    zlib: zlib,

    readFileAsBlob: (file) => {
        let data = fs.readFileSync(file);

        return new Blob([new Uint8Array(data).buffer], { type: mime.lookup(file) });
    },

    toArrayBuffer: (buffer) => {
        let ab = new ArrayBuffer(buffer.length);
        let b = new Uint8Array(ab);

        for (let i = 0; i < buffer.length; ++i) {
            b[i] = buffer[i];
        }

        return ab;
    },

    toBuffer: (ab) => {
        let buffer = new Buffer(ab.byteLength);
        let view = new Uint8Array(ab);

        for (let i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }

        return buffer;
    }
};

module.exports = IO;