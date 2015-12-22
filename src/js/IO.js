'use strict';

const buffer = global.require('buffer').Buffer;
const fs = global.require('fs');
const spawn = global.require('child_process').spawn;
const stream = global.require('stream');
const zlib = global.require('zlib');
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
