'use strict';

var IO = {
    Buffer: global.require('buffer').Buffer,
    fs: global.require('fs'),
    Spawn: global.require('child_process').spawn,
    Stream: global.require('stream'),
    zlib: global.require('zlib')
};

module.exports = IO;
