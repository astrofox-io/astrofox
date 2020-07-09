import { app, BrowserWindow, BrowserView } from 'electron';
import fs from 'fs';
import path from 'path';
import url from 'url';
import debug from 'debug';

const log = debug('window');

let win = null;

export function getWindow() {
  return win;
}

export function showWindow() {
  win.show();

  if (process.env.NODE_ENV !== 'production') {
    win.webContents.openDevTools();
  }
}

export function createWindow() {
  if (win !== null) return;

  // Create window
  win = new BrowserWindow({
    show: false,
    width: 1320,
    height: 1200,
    minWidth: 200,
    minHeight: 100,
    frame: false,
    backgroundColor: '#222222',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: process.env.NODE_ENV !== 'production',
      backgroundThrottling: false,
      textAreasAreResizable: false,
      webgl: true,
    },
  });

  const { webContents } = win;

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
        .filter(file => fs.statSync(path.join(fullPath, file)).isDirectory());

      if (dir.length) {
        const extPath = path.join(fullPath, dir[0]);
        log('Adding extension:', extPath);
        // session.loadExtension(extPath);
        BrowserWindow.addExtension(extPath);
      }
    });
  }

  // Create view
  const view = new BrowserView();
  win.setBrowserView(view);
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  view.webContents.loadURL('https://astrofox.io/hello');

  // Load index page
  win.loadURL(
    process.env.NODE_ENV === 'production'
      ? url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file',
          slashes: true,
        })
      : `http://localhost:${process.env.PORT}`,
  );

  // Show window when DOM ready
  webContents.on('dom-ready', () => {
    log('dom-ready');
    showWindow();
  });

  // Show window only when ready
  win.on('ready-to-show', () => {
    log('ready-to-show');
    showWindow();
  });

  // Window close
  win.on('close', () => {
    log('close');
    win = null;
  });

  win.on('closed', () => {
    log('closed');
    win = null;
  });
}

export function disposeWindow() {
  win = null;
}

export function sendMessage(channel, data) {
  win.webContents.send(channel, data);
}
