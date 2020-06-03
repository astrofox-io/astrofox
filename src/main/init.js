import { session, systemPreferences } from 'electron';
import path from 'path';
import glob from 'glob';
import debug from 'debug';
import { removeFile, createFolder } from 'utils/io';
import * as env from './environment';
import initMenu from './menu';
import initAutoUpdate from './autoupdate';

const log = debug('init');

async function removeTempFiles() {
  const files = glob.sync('*.*', { cwd: env.TEMP_PATH });

  files.forEach(file => removeFile(path.join(env.TEMP_PATH, file)));
}

export default async function init() {
  log('Initialize application');

  await createFolder(env.TEMP_PATH);
  await removeTempFiles();

  initMenu();
  initAutoUpdate();

  // Modify the user agent for all requests to the following urls
  const filter = {
    urls: ['https://*.astrofox.io/*'],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['User-Agent'] = env.USER_AGENT;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Disable menu items on macOS
  if (process.platform === 'darwin') {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
  }
}
