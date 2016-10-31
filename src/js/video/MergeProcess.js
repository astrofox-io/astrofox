'use strict';

const Process = require('./Process');

class MergeProcess extends Process {
    constructor(command, options) {
        super(command, options);
    }

    start() {
        let { audioFile, videoFile, outputFile } = this.options;

        super.start(
            [
                '-y',
                '-i', videoFile,
                '-i', audioFile,
                '-codec', 'copy',
                '-shortest',
                outputFile
            ]
        );
    }
}

module.exports = MergeProcess;