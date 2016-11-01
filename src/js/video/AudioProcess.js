'use strict';

const Process = require('./../core/Process');

class AudioProcess extends Process {
    constructor(command, options) {
        super(command);

        this.options = options;
    }

    start() {
        let { audioFile, start, duration, outputFile } = this.options;

        super.start(
            [
                '-y',
                '-i', audioFile,
                '-ss', start,
                '-t', duration,
                '-acodec', 'copy',
                outputFile
            ]
        );
    }
}

module.exports = AudioProcess;