'use strict';

const Process = require('./Process');

class AudioProcess extends Process {
    constructor(command, options) {
        super();

        this.command = command;
        this.options = options;
        this.process = null;
    }

    start() {
        let { audioFile, videoFile, output } = this.options;

        this.process = this.spawn(
            this.command,
            [
                '-y',
                '-i', videoFile,
                '-i', audioFile,
                '-codec', 'copy',
                '-shortest',
                output
            ]
        );

        this.emit('start');
    }
}

module.exports = AudioProcess;