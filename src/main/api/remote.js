import { remote } from 'electron';

const env = remote.getGlobal('env');

export function getEnvironment() {
  return env;
}
