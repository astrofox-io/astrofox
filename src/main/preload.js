import { contextBridge } from 'electron';
import * as api from 'main/api';

async function init() {
  api.log('Preload script loaded');

  const env = await api.getGlobal('env');

  contextBridge.exposeInMainWorld('__ASTROFOX__', {
    ...api,
    getEnvironment: () => env,
  });
}

init();
