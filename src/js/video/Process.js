'use strict';

const Transform = window.require('stream').Transform;
const spawn = window.require('child_process').spawn;

const EventEmitter = require('../core/EventEmitter');
const { Logger } = require('../core/Global');

class Process extends EventEmitter {
    constructor() {
        super();

        this.stream = new Transform();
        this.started = false;
        this.completed = false;
    }

    spawn(command, args) {
        Logger.log(command, args);

        // Spawn process
        this.process = spawn(command, args);

        // Connect handlers
        this.process.stdout.on('data', data => {
            this.emit('stdout', data);
        });

        this.process.stderr.on('data', data => {
            this.emit('stderr', data);
        });

        this.process.on('close', () => {
            this.completed = true;

            this.emit('close');
        });

        // Connect stream
        this.stream.pipe(this.process.stdin);
    }

    push(data) {
        this.stream.push(data);
    }

    end() {
        this.stream.push(null);
    }
}

module.exports = Process;