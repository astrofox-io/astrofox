import { remote } from 'electron';

const win = remote.getCurrentWindow();
const { dialog } = remote;

export function getWindow() {
  return win;
}

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

export function reloadWindow() {
  win.reload();
}

export function closeWindow() {
  win.close();
}

export function showOpenDialog(callback, options) {
  dialog.showOpenDialog(win, options, callback);
}

export function showSaveDialog(callback, options) {
  dialog.showSaveDialog(win, options, callback);
}

export function showMessageBox(title, message, options) {
  dialog.showMessageBox(win, { title, message, buttons: [], ...options });
}

export function showErrorBox(title, content) {
  dialog.showErrorBox(title, content);
}

export function openDevTools(options) {
  win.openDevTools({ mode: 'detach', ...options });
}
