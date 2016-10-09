'use strict';

const Process = require('./Process');

class MergeProcess extends Process {
    constructor(command, options) {
        super();

        this.command = command;
        this.options = options;
        this.process = null;
    }

    start() {
        let { audioFile, videoFile, outputFile } = this.options;

        this.process = this.spawn(
            this.command,
            [
                '-y',
                '-i', videoFile,
                '-i', audioFile,
                '-codec', 'copy',
                '-shortest',
                outputFile
            ]
        );

        this.emit('start');
    }
}

module.exports = MergeProcess;