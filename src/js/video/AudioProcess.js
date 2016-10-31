'use strict';

const Process = require('./Process');

class AudioProcess extends Process {
    constructor(command, options) {
        super(command, options);
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