import { app, BrowserWindow } from 'electron';
import debug from 'debug';
import * as env from './environment';
import init from './init';
import { createWindow, disposeWindow } from './window';

const log = debug('main');

// Show environment
log('NODE_ENV', process.env.NODE_ENV);

// Set global variables
global.env = env;

// Chrome flags
// Hardware acceleration
app.commandLine.appendSwitch('ignore-gpu-blacklist');

// Memory profiling
if (process.env.NODE_ENV !== 'production') {
  app.commandLine.appendSwitch('enable-precise-memory-info');
}

// Electron bug: https://github.com/electron/electron/issues/22119
app.allowRendererProcessReuse = false;

// Application events
app.on('ready', async () => {
  log('ready');

  await init();

  createWindow();
});

app.on('activate', () => {
  log('activate');

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  log('window-all-closed');

  disposeWindow();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  log('will-quit');
});
