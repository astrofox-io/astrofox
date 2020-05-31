import { Transform } from 'stream';
import { spawn } from 'child_process';

export function spawnProcess(command, args) {
  const stream = new Transform();
  const process = spawn(command, args);

  stream.pipe(process.stdin);

  const stop = signal => process.kill(signal);
  const push = data => stream.push(data);

  return { process, stop, push };
}
