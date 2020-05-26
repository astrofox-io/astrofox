import { remote } from 'electron';

const env = remote.getGlobal('env');

window.astrofox = {
  getEnvironment() {
    return env;
  },
};
