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

    readFileAsBlob: function(file) {
        var data = fs.readFileSync(file);

        return new Blob([new Uint8Array(data).buffer], { type: mime.lookup(file) });
    },

    toArrayBuffer: function(buffer) {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);

        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }

        return ab;
    },

    toBuffer: function(ab) {
        var buffer = new Buffer(ab.byteLength);
        var view = new Uint8Array(ab);

        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }

        return buffer;
    }
};

module.exports = IO;