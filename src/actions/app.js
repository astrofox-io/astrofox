import { createSlice } from '@reduxjs/toolkit';
import { api, renderer, stage, logger } from 'view/global';
import { loadConfig } from 'actions/config';
import { newProject } from 'actions/project';
import { checkForUpdates, updateDownloadProgress } from 'actions/updates';
import { raiseError } from 'actions/errors';
import { showModal } from './modals';

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

const appStore = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateApp(state, action) {
      return { ...state, ...action.payload };
    },
    setStatusText(state, action) {
      state.statusText = action.payload;
      return state;
    },
    setActiveEntityId(state, action) {
      state.activeEntityId = action.payload;
      return state;
    },
    setActiveReactorId(state, action) {
      state.activeReactorId = action.payload;
      return state;
    },
    toggleState(state, action) {
      const prop = action.payload;
      state[prop] = !state[prop];
      return state;
    },
  },
});

const { setStatusText, setActiveEntityId, setActiveReactorId, toggleState } = appStore.actions;

export { setStatusText, setActiveEntityId, setActiveReactorId, toggleState };

export default appStore.reducer;

export function exitApp() {
  api.closeWindow();
}

export function initApp() {
  return async (dispatch, getState) => {
    await dispatch(loadConfig());
    await dispatch(newProject());

    const { config } = getState();

    api.on('download-progress', info => {
      dispatch(updateDownloadProgress(info));
    });

    if (config.checkForUpdates) {
      await dispatch(checkForUpdates());

      const { hasUpdate } = getState().updates;

      if (hasUpdate) {
        dispatch(showModal('AppUpdates', { title: 'Updates' }));
      }
    }
  };
}

export function saveImage(file) {
  return async dispatch => {
    const { filePath, canceled } = await api.showSaveDialog({
      defaultPath: `image-${Date.now()}.png`,
    });

    if (!canceled) {
      try {
        const data = renderer.getFrameData(false);

        stage.render(data);

        const buffer = stage.getImage();

        await api.writeFile(file, buffer);

        logger.log('Image saved:', filePath);
      } catch (error) {
        dispatch(raiseError('Failed to save image file.', error));
      }
    }
  };
}
