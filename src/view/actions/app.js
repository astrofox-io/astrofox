import create from 'zustand';
import { api, logger, renderer, stage } from 'view/global';
import configStore, { loadConfig } from 'actions/config';
import updateStore, { checkForUpdates, updateDownloadProgress } from 'actions/updates';
import projectStore, {
  checkUnsavedChanges,
  newProject,
  openProjectFile,
  saveProjectFile,
} from 'actions/project';
import { showModal } from 'actions/modals';
import { raiseError } from 'actions/error';
import { openAudioFile } from 'actions/audio';
import { setZoom } from 'actions/stage';

const initialState = {
  statusText: '',
  showControlDock: true,
  showPlayer: true,
  showReactor: false,
  showWaveform: true,
  showOsc: false,
  activeReactorId: null,
  activeElementId: null,
};

const appStore = create(() => ({
  ...initialState,
}));

export function toggleState(key) {
  appStore.setState(state => ({ [key]: !state[key] }));
}

export function exitApp() {
  api.closeWindow();
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

export function setActiveReactorId(reactorId) {
  appStore.setState({ activeReactorId: reactorId || null });
}

export function setActiveElementId(elementId) {
  appStore.setState({ activeElementId: elementId || null });
}

export async function handleMenuAction(action) {
  const { projectFile } = projectStore.getState();

  switch (action) {
    case 'new-project':
      await checkUnsavedChanges(action, newProject);
      break;

    case 'open-project':
      await checkUnsavedChanges(action, openProjectFile);
      break;

    case 'save-project':
      await saveProjectFile(projectFile);
      break;

    case 'save-project-as':
      await saveProjectFile();
      break;

    case 'load-audio':
      await openAudioFile();
      break;

    case 'save-image':
      await saveImage();
      break;

    case 'save-video':
      await showModal('VideoSettings', { title: 'Save Video' });
      break;

    case 'edit-canvas':
      await showModal('CanvasSettings', { title: 'Canvas' });
      break;

    case 'edit-settings':
      await showModal('AppSettings', { title: 'Settings' });
      break;

    case 'zoom-in':
      await setZoom(1);
      break;

    case 'zoom-out':
      await setZoom(-1);
      break;

    case 'zoom-reset':
      await setZoom(0);
      break;

    case 'view-control-dock':
      await toggleState('showControlDock');
      break;

    case 'view-player':
      await toggleState('showPlayer');
      break;

    case 'check-for-updates':
      await showModal('AppUpdates', { title: 'Updates' });
      break;

    case 'open-dev-tools':
      api.openDevTools();
      break;

    case 'about':
      await showModal('About');
      break;

    case 'exit':
      await exitApp();
      break;
  }
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

  api.on('menu-action', handleMenuAction);
}

export default appStore;
