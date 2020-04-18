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

export function showOpenDialog(callback, properties) {
  dialog.showOpenDialog(win, properties, callback);
}

export function showSaveDialog(callback, properties) {
  dialog.showSaveDialog(win, properties, callback);
}

export function showMessageBox(title, message, properties) {
  dialog.showMessageBox(win, { title, message, buttons: [], ...properties });
}

export function showErrorBox(title, content) {
  dialog.showErrorBox(title, content);
}

export function openDevTools(properties) {
  win.openDevTools({ mode: 'detach', ...properties });
}
