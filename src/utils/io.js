import fs from 'fs';
import zlib from 'zlib';
import mime from 'mime';

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

export function readFile(file) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.readFileSync(file));
        }
        catch (err) {
            reject(err);
        }
    });
}

export function readFileCompressed(file) {
    return readFile(file).then(data => decompress(data));
}

export function readFileAsBlob(file) {
    return readFile(file).then(data => Promise.resolve(new Blob(
        [new Uint8Array(data).buffer],
        { type: mime.getType(file) },
    )));
}

export function readAsArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (e) => {
            reject(e.target.error);
        };

        reader.readAsArrayBuffer(blob);
    });
}

export function readAsDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (e) => {
            reject(e.target.error);
        };

        reader.readAsDataURL(blob);
    });
}

export function writeFile(file, data) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.writeFileSync(file, data));
        }
        catch (err) {
            reject(err);
        }
    });
}

export function writeFileCompressed(file, data) {
    return compress(data).then(buffer => writeFile(file, buffer));
}

export function removeFile(file) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.unlinkSync(file));
        }
        catch (err) {
            reject(err);
        }
    });
}

export function createFolder(path) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.mkdirSync(path));
        }
        catch (err) {
            if (err.code === 'EEXIST') resolve();

            reject(err);
        }
    });
}

export function fileExists(file) {
    return fs.existsSync(file);
}
