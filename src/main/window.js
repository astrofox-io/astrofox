import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import url from 'url';
import debug from 'debug';

const log = debug('window');

let mainWindow = null;

export function getWindow() {
  return mainWindow;
}

export function showWindow() {
  mainWindow.show();

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }
}

export function createWindow() {
  if (mainWindow !== null) return;

  // Create window
  mainWindow = new BrowserWindow({
    show: false,
    width: 1320,
    height: 1200,
    minWidth: 200,
    minHeight: 100,
    frame: false,
    backgroundColor: '#222222',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      backgroundThrottling: false,
      devTools: process.env.NODE_ENV !== 'production',
      experimentalCanvasFeatures: true,
      nodeIntegration: true,
      textAreasAreResizable: false,
      webgl: true,
    },
  });

  const { webContents } = mainWindow;

  // Production settings
  if (process.env.NODE_ENV === 'production') {
    // Auto close devtools if opened
    webContents.on('devtools-opened', () => {
      webContents.closeDevTools();
    });
  }

  // Development settings
  if (process.env.NODE_ENV !== 'production') {
    const dirs = {
      win32: '/AppData/Local/Google/Chrome/User Data/Default/Extensions',
      darwin: '/Library/Application Support/Google/Chrome/Default/Extensions',
    };

    // Electron 9.0
    // const { session } = webContents;

    const extensions = ['fmkadmapgofadopljbjfkapdkoienihi', 'lmhkpmbekcpmknklioeibfkpmmfibljd'];

    extensions.forEach(ext => {
      const fullPath = path.join(app.getPath('home'), dirs[process.platform], ext);

      const dir = fs
        .readdirSync(fullPath)
        .filter(f => fs.statSync(path.join(fullPath, f)).isDirectory());

      if (dir.length) {
        const extPath = path.join(fullPath, dir[0]);
        log('Adding extension:', extPath);
        // session.loadExtension(extPath);
        BrowserWindow.addExtension(extPath);
      }
    });
  }

  // Load index page
  mainWindow.loadURL(
    process.env.NODE_ENV === 'production'
      ? url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file',
          slashes: true,
        })
      : 'http://localhost:3000',
  );

  // Show window when DOM ready
  webContents.on('dom-ready', () => {
    log('dom-ready');
    showWindow();
  });

  // Show window only when ready
  mainWindow.on('ready-to-show', () => {
    log('ready-to-show');
    showWindow();
  });

  // Window close
  mainWindow.on('close', () => {
    log('close');
    mainWindow = null;
  });

  mainWindow.on('closed', () => {
    log('closed');
    mainWindow = null;
  });
}

export function disposeWindow() {
  mainWindow = null;
}
