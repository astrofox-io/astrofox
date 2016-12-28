'use strict';

const path = window.require('path');

const Process = require('../core/Process');
const { TEMP_PATH } = require('../core/Global');

class RenderProcess extends Process {
    constructor(command) {
        super(command);
    }

    start(id, fps, format) {
        return new Promise((resolve, reject) => {
            let outputFile = path.join(TEMP_PATH, id + '.' + format);

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
                    '-r', fps,
                    '-f', 'image2pipe',
                    '-vcodec', 'png',
                    '-i', 'pipe:0',
                    '-vcodec', 'libx264',
                    '-movflags', '+faststart',
                    '-pix_fmt', 'yuv420p',
                    '-f', format,
                    '-stats',
                    outputFile
                ]
            );
        });
    }
}

module.exports = RenderProcess;