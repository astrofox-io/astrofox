import { ipcRenderer } from 'electron';

export function send(channel, data) {
  ipcRenderer.send(channel, data);
}

export function on(channel, callback) {
  ipcRenderer.on(channel, (event, ...args) => callback(...args));
}

export function once(channel, callback) {
  ipcRenderer.once(channel, (event, ...args) => callback(...args));
}

export function off(channel, callback) {
  if (callback) {
    ipcRenderer.removeListener(channel, callback);
  } else {
    ipcRenderer.removeAllListeners(channel);
  }
}

export async function invoke(channel, data) {
  return ipcRenderer.invoke(channel, data);
}

export function log(data) {
  return invoke('log', data);
}

export async function getGlobal(key) {
  return invoke('get-global', key);
}
