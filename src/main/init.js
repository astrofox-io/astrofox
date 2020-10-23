import { app, session, systemPreferences } from 'electron';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import debug from 'debug';
import { removeFile, createFolder } from 'utils/io';
import * as env from './environment';
import initMenu from './menu';
import initAutoUpdate from './autoupdate';
import initEvents from './events';

const log = debug('init');

async function removeTempFiles() {
  const files = glob.sync('*.*', { cwd: env.TEMP_PATH });
  const promises = [];

  files.forEach(file => promises.push(removeFile(path.join(env.TEMP_PATH, file))));

  return Promise.all(promises);
}

function loadExtensions(session) {
  const dirs = {
    win32: '/AppData/Local/Google/Chrome/User Data/Default/Extensions',
    darwin: '/Library/Application Support/Google/Chrome/Default/Extensions',
    linux: '/.config/google-chrome/Default/Extensions',
  };

  const extensions = ['fmkadmapgofadopljbjfkapdkoienihi', 'lmhkpmbekcpmknklioeibfkpmmfibljd'];
  const promises = [];

  for (const ext of extensions) {
    const fullPath = path.join(app.getPath('home'), dirs[process.platform], ext);

    if (fs.existsSync(fullPath)) {
      const dir = fs
        .readdirSync(fullPath)
        .filter(file => fs.statSync(path.join(fullPath, file)).isDirectory());

      if (dir.length) {
        log('Adding extension:', ext);
        const extPath = path.join(fullPath, dir[0]);
        promises.push(session.loadExtension(extPath));
      }
    }
  }

  return Promise.all(promises);
}

export default async function init() {
  log('Initialize application');

  await createFolder(env.TEMP_PATH);
  await removeTempFiles();

  if (process.env.NODE_ENV !== 'production') {
    await loadExtensions(session.defaultSession);
  }

  initMenu();
  initEvents();
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
