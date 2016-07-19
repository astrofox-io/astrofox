'use strict';

const NodeBuffer = window.require('buffer').Buffer;
const fs = window.require('fs');
const zlib = window.require('zlib');
const mime = require('mime');

function readFile(file) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.readFileSync(file));
        }
        catch(err) {
            reject(err);
        }
    });
}

function readFileCompressed(file) {
    return readFile(file).then(data => {
        return decompress(data);
    });
}

function readFileAsBlob(file) {
    let data = fs.readFileSync(file);

    return new Blob([new Uint8Array(data).buffer], { type: mime.lookup(file) });
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader(),
            data = readFileAsBlob(file);

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = () => {
            reject(data.error);
        };

        reader.readAsArrayBuffer(data);
    });
}

function writeFile(file, data) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.writeFileSync(file, data));
        }
        catch(err) {
            reject(err);
        }
    });
}

function writeFileCompressed(file, data) {
    return compress(data).then(buffer => {
        return writeFile(file, buffer);
    })
}

function toArrayBuffer(buffer) {
    let ab = new ArrayBuffer(buffer.length);
    let b = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i) {
        b[i] = buffer[i];
    }

    return ab;
}

function toBuffer(ab) {
    let buffer = new NodeBuffer(ab.byteLength);
    let view = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }

    return buffer;
}

function compress(data) {
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
            }
        )
    });
}

function decompress(data) {
    return new Promise((resolve, reject) => {
        zlib.unzip(
            data,
            (error, buffer) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(buffer)
                }
            }
        );
    });
}

function fileExists(file) {
    try {
        fs.statSync(file);
    }
    catch (e) {
        return false;
    }

    return true;
}

module.exports = {
    readFile,
    readFileCompressed,
    readFileAsBlob,
    readFileAsArrayBuffer,
    writeFile,
    writeFileCompressed,
    toArrayBuffer,
    toBuffer,
    compress,
    decompress,
    fileExists
};