const Transform = require('stream').Transform;
const spawn = require('child_process').spawn;

import EventEmitter from './EventEmitter';
import { logger } from './Global';

export default class Process extends EventEmitter {
    constructor(command) {
        super();

        this.command = command;
        this.stream = new Transform();
        this.process = null;
    }

    start(args) {
        logger.log('%cStarting process:', 'color:lightgreen;background-color:gray;', this.command, (args || []).join(' '));

        // Spawn process
        this.process = spawn(this.command, args);

        // Connect handlers
        this.process.stdout.on('data', data => {
            this.emit('stdout', data);
        });

        this.process.stderr.on('data', data => {
            this.emit('stderr', data);
        });

        this.process.on('close', (code, signal) => {
            this.emit('close', code, signal);
        });

        this.process.on('exit', (code, signal) => {
            this.emit('exit', code, signal);
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