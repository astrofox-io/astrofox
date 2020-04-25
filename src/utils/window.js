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

export function showOpenDialog(properties) {
  return dialog.showOpenDialog(win, properties);
}

export function showSaveDialog(properties) {
  return dialog.showSaveDialog(win, properties);
}

export function showMessageBox(title, message, properties) {
  return dialog.showMessageBox(win, { title, message, buttons: [], ...properties });
}

export function showErrorBox(title, content) {
  return dialog.showErrorBox(title, content);
}

export function openDevTools(properties) {
  win.openDevTools({ mode: 'detach', ...properties });
}
