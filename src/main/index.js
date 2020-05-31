import { app, systemPreferences, session, BrowserWindow } from 'electron';
import fs from 'fs';
import debug from 'debug';
import * as env from './environment';
import initMenu from './menu';
import initAutoUpdate from './autoupdate';
import { createWindow, disposeWindow } from './window';

const log = debug('main');

// Show environment
log('NODE_ENV', process.env.NODE_ENV);

// Set global variables
global.env = env;

// Create temp folder for application
function createTempFolder() {
  try {
    fs.mkdirSync(env.TEMP_PATH);
    log('Temp folder created:', env.TEMP_PATH);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      log('ERROR:', err.message);
    }
  }
}

// Chrome flags
// Hardware acceleration
app.commandLine.appendSwitch('ignore-gpu-blacklist');

// Memory profiling
if (process.env.NODE_ENV !== 'production') {
  app.commandLine.appendSwitch('enable-precise-memory-info');
}

// Application events
app.on('ready', () => {
  log('ready');

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

  createTempFolder();

  createWindow();
});

app.on('window-all-closed', () => {
  log('window-all-closed');

  disposeWindow();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  log('activate');

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  log('will-quit');
});
