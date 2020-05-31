import EventEmitter from 'core/EventEmitter';
import { api, logger } from 'view/global';

export default class Process extends EventEmitter {
  constructor(command) {
    super();

    this.command = command;
  }

  start(args) {
    logger.log('Starting process:', this.command, (args || []).join(' '));

    // Spawn process
    const { process, stop, push } = api.spawnProcess(this.command, args);

    // Connect handlers
    process.stdout.on('data', data => {
      this.emit('stdout', data);
    });

    process.stderr.on('data', data => {
      this.emit('stderr', data);
    });

    process.on('close', (code, signal) => {
      logger.log('Process ended with code', code, 'and signal', signal);

      this.emit('close', code, signal);
    });

    process.on('exit', (code, signal) => {
      this.emit('exit', code, signal);
    });

    process.on('error', err => {
      this.emit('error', err);
    });

    this.process = process;
    this.stop = stop;
    this.push = push;

    this.emit('start');
  }
}
