import { contextBridge, ipcRenderer } from 'electron';

// Resolve environment and the storage snapshot before exposing the bridge so
// getEnvironment() and storage.get() stay sync.
const [environment, storageSnapshot] = await Promise.all([
  ipcRenderer.invoke('desktop:get-environment'),
  ipcRenderer.invoke('storage:get-all').catch(error => {
    console.error('storage:get-all failed:', error);
    return {};
  }),
]);

// This window is the only writer, so the in-memory cache is the source of
// truth for reads. Writes are applied here synchronously and then serialized
// to the main process in order.
const storageCache = new Map(Object.entries(storageSnapshot ?? {}));
let storagePending = Promise.resolve();

function queueStorageWrite(channel, payload) {
  storagePending = storagePending
    .then(() => ipcRenderer.invoke(channel, payload))
    .then(() => undefined)
    .catch(error => {
      console.error(`${channel} failed:`, error);
    });
}

function assertString(name, value) {
  if (typeof value !== 'string') {
    throw new TypeError(`storage ${name} must be a string`);
  }
}

const storage = {
  get: key => (storageCache.has(key) ? storageCache.get(key) : null),
  keys: () => Array.from(storageCache.keys()),
  set: (key, value) => {
    assertString('key', key);
    assertString('value', value);
    storageCache.set(key, value);
    queueStorageWrite('storage:set', { key, value });
  },
  remove: key => {
    assertString('key', key);
    storageCache.delete(key);
    queueStorageWrite('storage:remove', { key });
  },
  flush: () => storagePending,
};

const api = {
  isDesktop: true,

  getEnvironment: () => environment,

  storage,

  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  getWindowState: () => ipcRenderer.invoke('window:get-state'),

  openPath: targetPath => ipcRenderer.invoke('desktop:open-path', targetPath),
  showItemInFolder: targetPath => ipcRenderer.invoke('desktop:show-item-in-folder', targetPath),

  showSaveDialog: options => ipcRenderer.invoke('dialog:show-save', options),
  showOpenDialog: options => ipcRenderer.invoke('dialog:show-open', options),

  writeTempFile: (name, data) => ipcRenderer.invoke('desktop:write-temp-file', { name, data }),
  removePath: filePath => ipcRenderer.invoke('desktop:remove-path', { filePath }),
  readFile: filePath => ipcRenderer.invoke('desktop:read-file', { filePath }),
  writeFile: (filePath, data) => ipcRenderer.invoke('desktop:write-file', { filePath, data }),

  ffmpegRun: (args, id) => ipcRenderer.invoke('ffmpeg:run', { args, id }),
  ffmpegStartPipe: (args, id) => ipcRenderer.invoke('ffmpeg:start-pipe', { args, id }),
  ffmpegWrite: (id, data) => ipcRenderer.invoke('ffmpeg:write', { id, data }),
  ffmpegEndPipe: id => ipcRenderer.invoke('ffmpeg:end-pipe', { id }),
  ffmpegKill: id => ipcRenderer.invoke('ffmpeg:kill', { id }),

  updater: {
    getStatus: () => ipcRenderer.invoke('updater:get-status'),
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    onStatus: callback => {
      if (typeof callback !== 'function') {
        return () => {};
      }
      const listener = (_event, status) => callback(status);
      ipcRenderer.on('updater:status', listener);
      return () => {
        ipcRenderer.removeListener('updater:status', listener);
      };
    },
  },

  onWindowStateChanged: callback => {
    if (typeof callback !== 'function') {
      return () => {};
    }
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('window-state-changed', listener);
    return () => {
      ipcRenderer.removeListener('window-state-changed', listener);
    };
  },
};

contextBridge.exposeInMainWorld('__ASTROFOX__', api);
