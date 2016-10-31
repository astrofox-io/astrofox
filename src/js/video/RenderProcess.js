'use strict';

const Process = require('./Process');

class RenderProcess extends Process {
    constructor(command, options) {
        super(command, options);
    }

    start() {
        let { fps, format, outputFile } = this.options;

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
    }
}

module.exports = RenderProcess;