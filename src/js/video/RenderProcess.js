'use strict';

const Process = require('./Process');

class RenderProcess extends Process {
    constructor(command, options) {
        super();

        this.command = command;
        this.options = options;
        this.process = null;
    }

    start() {
        let { fps, outputFile } = this.options;

        this.process = this.spawn(
            this.command,
            [
                '-y',
                '-r', fps,
                '-f', 'image2pipe',
                '-vcodec', 'png',
                '-i', 'pipe:0',
                '-vcodec', 'libx264',
                '-movflags', '+faststart',
                '-pix_fmt', 'yuv420p',
                '-f', 'mp4',
                '-stats',
                outputFile
            ]
        );

        this.emit('start');
    }
}

module.exports = RenderProcess;