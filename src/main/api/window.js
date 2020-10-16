import { invoke } from './ipc';

export function maximizeWindow() {
  return invoke('maximize-window');
}

export function unmaximizeWindow() {
  return invoke('unmaximize-window');
}

export function minimizeWindow() {
  return invoke('minimize-window');
}

export function closeWindow() {
  return invoke('close-window');
}

export function openDevTools() {
  return invoke('open-dev-tools');
}

export async function showOpenDialog(props) {
  return invoke('show-open-dialog', props);
}

export async function showSaveDialog(props) {
  return invoke('show-save-dialog', props);
}

export async function getWindowState() {
  return invoke('get-window-state');
}
