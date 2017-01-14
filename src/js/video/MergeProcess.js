'use strict';

const Process = require('../core/Process');

class MergeProcess extends Process {
    constructor(command) {
        super(command);
    }

    start(videoFile, audioFile, outputFile) {
        return new Promise((resolve, reject) => {
            this.on('close', () => {
                resolve();
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
                    '-i', videoFile,
                    '-i', audioFile,
                    '-codec', 'copy',
                    '-shortest',
                    '-movflags', '+faststart',
                    outputFile
                ]
            );
        });
    }
}

module.exports = MergeProcess;