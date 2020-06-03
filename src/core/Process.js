import EventEmitter from 'core/EventEmitter';
import { api, logger } from 'view/global';

export default class Process extends EventEmitter {
  constructor(command) {
    super();

    this.command = command;
  }

  start(args) {
    logger.log('Starting process:', this.command, (args || []).join(' '));

    const handlers = {
      onStdOut: data => {
        this.emit('data', data);
      },
      onStdErr: data => {
        this.emit('data', data);
      },
      onClose: (code, signal) => {
        logger.log('Process ended with code', code, 'and signal', signal);

        this.emit('close', code, signal);
      },
      onExit: (code, signal) => {
        this.emit('exit', code, signal);
      },
      onError: err => {
        this.emit('error', err);
      },
    };

    // Spawn process
    const { stop, push } = api.spawnProcess(this.command, args, handlers);

    this.stop = stop;
    this.push = push;

    this.emit('start');
  }
}
