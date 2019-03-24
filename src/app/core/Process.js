import { Transform } from 'stream';
import { spawn } from 'child_process';

import EventEmitter from 'core/EventEmitter';
import { logger } from 'app/global';

export default class Process extends EventEmitter {
  constructor(command) {
    super();

    this.command = command;
    this.stream = new Transform();
    this.process = null;
  }

  start(args) {
    logger.log('Starting process:', this.command, (args || []).join(' '));

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
      logger.log('Process ended with code', code, 'and signal', signal);

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

  stop(signal) {
    this.process.kill(signal);
  }

  push(data) {
    this.stream.push(data);
  }
}
