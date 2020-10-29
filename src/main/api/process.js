import { spawn } from 'child_process';

export function spawnProcess(command, args, props = {}) {
  const process = spawn(command, args);
  const { onStdOut, onStdErr, onClose, onExit, onError } = props;

  if (onStdOut) {
    process.stdout.on('data', data => onStdOut(data.toString()));
  }
  if (onStdErr) {
    process.stderr.on('data', data => onStdErr(data.toString()));
  }
  if (onClose) {
    process.on('close', onClose);
  }
  if (onExit) {
    process.on('exit', onExit);
  }
  if (onError) {
    process.on('error', onError);
  }

  const stop = signal => process.kill(signal);
  const push = data => process.stdin.write(data);
  const end = () => process.stdin.destroy();

  return { stop, push, end };
}
