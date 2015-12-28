'use strict';

const buffer = window.require('buffer').Buffer;
const fs = window.require('fs');
const spawn = window.require('child_process').spawn;
const stream = window.require('stream');
const zlib = window.require('zlib');
const mime = require('mime');

var IO = {
    Buffer: buffer,
    fs: fs,
    Spawn: spawn,
    Stream: stream,
    zlib: zlib,

    readFileAsBlob: function(file) {
        var data = fs.readFileSync(file);

        return new Blob([new Uint8Array(data).buffer], { type: mime.lookup(file) });
    }
};

module.exports = IO;