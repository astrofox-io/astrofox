'use strict';

const path = window.require('path');

const Process = require('../core/Process');
const { replaceExt } = require('../util/file');

const codecs = {
    mp4: 'aac',
    webm: 'libvorbis'
};

const exts = {
    mp4: '.acc',
    webm: '.ogg'
};

class AudioProcess extends Process {
    constructor(command) {
        super(command);
    }

    start(outputFile, format, audioFile, timeStart, timeEnd) {
        return new Promise((resolve, reject) => {
            let ext = path.extname(audioFile),
                duration = timeEnd - timeStart,
                codec = codecs[format],
                outputExt = exts[format];

            if ((format === 'mp4' && ['.mp3','.m4a','aac'].indexOf(ext) >= 0) ||
                (format === 'webm' && ext === '.ogg')) {
                codec = 'copy';
                outputExt = ext;
            }

            outputFile = replaceExt(outputFile, outputExt);

            this.on('close', () => {
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

            // Encdoing options
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

module.exports = AudioProcess;