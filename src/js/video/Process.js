'use strict';

const Transform = window.require('stream').Transform;
const spawn = window.require('child_process').spawn;

const EventEmitter = require('../core/EventEmitter');

class Process extends EventEmitter {
    constructor() {
        super();

        this.stream = new Transform();
        this.started = false;
        this.completed = false;
    }

    spawn(command, args) {
        console.log(command, args);

        // Spawn process
        this.process = spawn(command, args);

        // Connect handlers
        // FFmpeg outputs data to stderr instead of stdout
        this.process.stderr.on('data', this.handleData.bind(this));
        this.process.on('close', this.handleClose.bind(this));

        // Connect stream
        this.stream.pipe(this.process.stdin);
    }

    push(data) {
        this.stream.push(data);
    }

    end() {
        this.stream.push(null);
    }

    handleData(data) {
        if (!this.started) {
            this.started = true;
        }

        this.emit('data', data);
    }

    handleClose() {
        this.completed = true;

        this.emit('close');
    }
}

module.exports = Process;