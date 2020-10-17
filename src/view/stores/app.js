import create from 'zustand';
import { api, logger, renderer, stage } from '../global';
import { loadConfig } from '../actions/config';
import { newProject } from '../actions/project';
import { checkForUpdates, updateDownloadProgress } from '../actions/updates';
import { showModal } from '../actions/modals';
import { raiseError } from '../actions/errors';
import configStore from './config';
import updateStore from './updates';

const initialState = {
  statusText: '',
  showControlDock: true,
  showPlayer: true,
  showReactor: false,
  showWaveform: true,
  showOsc: false,
  activeEntityId: null,
  activeReactorId: null,
};

const appStore = create(() => ({
  ...initialState,
}));

export function exitApp() {
  api.closeWindow();
}

export async function initApp() {
  await loadConfig();
  await newProject();

  const config = configStore.getState();

  api.on('download-progress', info => {
    updateDownloadProgress(info);
  });

  if (config.checkForUpdates) {
    await checkForUpdates();

    const { hasUpdate } = updateStore.getState();

    if (hasUpdate) {
      showModal('AppUpdates', { title: 'Updates' });
    }
  }
}

export async function saveImage() {
  const { filePath, canceled } = await api.showSaveDialog({
    defaultPath: `image-${Date.now()}.png`,
  });

  if (!canceled) {
    try {
      const data = renderer.getFrameData(false);

      stage.render(data);

      const buffer = stage.getImage();

      await api.saveImageFile(filePath, buffer);

      logger.log('Image saved:', filePath);
    } catch (error) {
      raiseError('Failed to save image file.', error);
    }
  }
}

export default appStore;
