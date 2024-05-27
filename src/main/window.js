import { BrowserWindow, WebContentsView } from 'electron';
import path from 'path';
import url from 'url';
import debug from 'debug';
import {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  WINDOW_MINWIDTH,
  WINDOW_MINHEIGHT,
  WINDOW_BGCOLOR,
} from './constants';

const PORT = process.env.PORT || 3000;
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

export function disposeWindow() {
  win = null;
}

export function sendMessage(channel, data) {
  win.webContents.send(channel, data);
}

export function getWindowState() {
  return {
    focused: win.isFocused(),
    maximized: win.isMaximized(),
    minimized: win.isMinimized(),
  };
}

export function updateWindowState() {
  sendMessage('window-state-changed', getWindowState());
}

export function createWindow() {
  if (win !== null) return;

  // Create window
  win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: WINDOW_MINWIDTH,
    minHeight: WINDOW_MINHEIGHT,
    backgroundColor: WINDOW_BGCOLOR,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      backgroundThrottling: false,
      textAreasAreResizable: false,
      devTools: true,
      webgl: true,
      sandbox: false,
    },
  });

  if (process.env.NODE_ENV === 'production') {
    const view = new WebContentsView();
    win.contentView.addChildView(view);
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    view.webContents.loadURL('https://astrofox.io/hello');
  }

  const url_index = new URL("file://"+path.join(__dirname, 'index.html'))
  // Load index page
  win.loadURL(
    process.env.NODE_ENV === 'production'
      ? url_index.toString()
      : `http://localhost:${PORT}`,
  );

  // Show window only when ready
  win.on('ready-to-show', () => {
    log('ready-to-show');
    showWindow();
  });

  // Window close
  win.on('close', () => {
    log('close');
  });

  win.on('closed', () => {
    log('closed');
  });

  // State events
  win.on('minimize', updateWindowState);
  win.on('maximize', updateWindowState);
  win.on('unmaximize', updateWindowState);
  win.on('focus', updateWindowState);
  win.on('blur', updateWindowState);
}