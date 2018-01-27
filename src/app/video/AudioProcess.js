import path from 'path';

import Process from 'core/Process';
import { replaceExt } from 'utils/file';

const codecs = {
    mp4: 'aac',
    webm: 'libvorbis'
};

const exts = {
    mp4: '.aac',
    webm: '.ogg'
};

export default class AudioProcess extends Process {
    constructor(command) {
        super(command);
    }

    start(outputFile, format, audioFile, timeStart, timeEnd) {
        return new Promise((resolve, reject) => {
            let ext = path.extname(audioFile),
                duration = timeEnd - timeStart,
                codec = codecs[format],
                outputExt = exts[format];

            // If source is already in correct format, just copy
            if ((format === 'mp4' && ['.m4a','.aac'].indexOf(ext) >= 0) ||
                (format === 'webm' && ext === '.ogg')) {
                codec = 'copy';
                outputExt = ext;
            }

            outputFile = replaceExt(outputFile, outputExt);

            this.on('close', code => {
                if (code !== 0) {
                    reject('Process was terminated.');
                }
                resolve(outputFile);
            });

            this.on('error', err => {
                reject(err);
            });

            this.on('stderr', data => {
                this.emit('data', data);
            });

            let args = [
                '-y',
                '-i', audioFile,
                '-ss', timeStart,
                '-t', duration,
                '-c:a', codec,
            ];

            // Encoding options
            if (codec === 'aac') {
                args.push('-b:a', '192k');
            }
            else if (codec === 'libvorbis') {
                args.push('-qscale:a', 6);
            }

            // Output file
            args.push(outputFile);

            super.start(args);
        });
    }
}