'use strict';

const path = window.require('path');

const Process = require('../core/Process');
const { TEMP_PATH } = require('../core/Global');

const codecs = ['.m4a','.aac'];

class AudioProcess extends Process {
    constructor(command) {
        super(command);
    }

    start(id, audioFile, start, duration) {
        return new Promise((resolve, reject) => {
            let ext = path.extname(audioFile),
                codec = (codecs.indexOf(ext) >= 0) ? 'copy' : 'aac',
                outputExt = (codec === 'copy') ? ext : '.aac',
                outputFile = path.join(TEMP_PATH, id + outputExt);

            this.on('close', () => {
                resolve(outputFile);
            });

            this.on('error', err => {
                reject(err);
            });

            this.on('stderr', data => {
                this.emit('data', data);
            });

            super.start(
                [
                    '-y',
                    '-i', audioFile,
                    '-ss', start,
                    '-t', duration,
                    '-acodec', codec,
                    '-vbr', 3,
                    outputFile
                ]
            );
        });
    }
}

module.exports = AudioProcess;