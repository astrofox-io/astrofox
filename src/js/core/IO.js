'use strict';

const fs = require('fs');
const zlib = require('zlib');
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
    return readFile(file).then(data => {
        return Promise.resolve(
            new Blob(
                [new Uint8Array(data).buffer],
                { type: mime.lookup(file) }
            )
        );
    });
}

function readAsArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (e) => {
            reject(e.target.error);
        };

        reader.readAsArrayBuffer(blob);
    });
}

function readAsDataUrl(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (e) => {
            reject(e.target.error);
        };

        reader.readAsDataURL(blob);
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
    });
}

function removeFile(file) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.unlinkSync(file));
        }
        catch(err) {
            reject(err);
        }
    });
}

function createFolder(path) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.mkdirSync(path));
        }
        catch(err) {
            if (err.code === 'EEXIST') resolve();

            reject(err);
        }
    });
}

function fileExists(file) {
    return fs.existsSync(file);
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
        );
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
                    resolve(buffer);
                }
            }
        );
    });
}

module.exports = {
    readFile,
    readFileCompressed,
    readFileAsBlob,
    readAsArrayBuffer,
    readAsDataUrl,
    writeFile,
    writeFileCompressed,
    removeFile,
    createFolder,
    fileExists,
    compress,
    decompress
};