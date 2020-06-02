import { remote } from 'electron';

const win = remote.getCurrentWindow();
const { dialog } = remote;

export function maximizeWindow() {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
}

export function unmaximizeWindow() {
  win.unmaximize();
}

export function minimizeWindow() {
  win.minimize();
}

export function closeWindow() {
  win.close();
}

export function getWindowState() {
  return {
    focused: win.isFocused(),
    maximized: win.isMaximized(),
    minimized: win.isMinimized(),
  };
}

export function showOpenDialog(props) {
  return dialog.showOpenDialog(win, props);
}

export function showSaveDialog(props) {
  return dialog.showSaveDialog(win, props);
}

function updateWindowState() {
  win.webContents.send('window-state-changed', getWindowState());
}

// Events
win.on('minimize', updateWindowState);
win.on('maximize', updateWindowState);
win.on('unmaximize', updateWindowState);
win.on('focus', updateWindowState);
win.on('blur', updateWindowState);
