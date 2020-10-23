import { contextBridge } from 'electron';
import * as api from 'main/api';

async function init() {
  api.log('Preload script loaded');

  const env = await api.getGlobal('env');

  await api.loadPlugins(env.PLUGIN_PATH);

  contextBridge.exposeInMainWorld('__ASTROFOX__', {
    ...api,
    getEnvironment: () => env,
  });
}

init();
