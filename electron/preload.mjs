import { contextBridge, ipcRenderer } from 'electron';

// Resolve environment before exposing the bridge so getEnvironment() stays sync.
const environment = await ipcRenderer.invoke('desktop:get-environment');

const api = {
  isDesktop: true,

  getEnvironment: () => environment,

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

  ffmpegRun: args => ipcRenderer.invoke('ffmpeg:run', { args }),
  ffmpegStartPipe: (args, id) => ipcRenderer.invoke('ffmpeg:start-pipe', { args, id }),
  ffmpegWrite: (id, data) => ipcRenderer.invoke('ffmpeg:write', { id, data }),
  ffmpegEndPipe: id => ipcRenderer.invoke('ffmpeg:end-pipe', { id }),
  ffmpegKill: id => ipcRenderer.invoke('ffmpeg:kill', { id }),

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
