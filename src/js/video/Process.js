'use strict';

const Transform = window.require('stream').Transform;
const spawn = window.require('child_process').spawn;

const EventEmitter = require('../core/EventEmitter');
const { Logger } = require('../core/Global');

class Process extends EventEmitter {
    constructor(command, options) {
        super();

        this.command = command;
        this.options = options;

        this.stream = new Transform();
        this.process = null;
    }

    start(args) {
        Logger.log(this.command, args);

        // Spawn process
        this.process = spawn(this.command, args);

        // Connect handlers
        this.process.stdout.on('data', data => {
            this.emit('stdout', data);
        });

        this.process.stderr.on('data', data => {
            this.emit('stderr', data);
        });

        this.process.on('close', code => {
            this.emit('close', code);
        });

        this.process.on('error', err => {
            this.emit('error', err);
        });

        // Connect stream
        this.stream.pipe(this.process.stdin);

        this.emit('start');
    }

    push(data) {
        this.stream.push(data);
    }
}

module.exports = Process;