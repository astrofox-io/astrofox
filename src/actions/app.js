import { remote } from 'electron';
import { createSlice } from '@reduxjs/toolkit';
import { env, events, updater, license, renderer, stage, logger } from 'view/global';
import menuConfig from 'view/config/menu';
import { loadConfig } from 'actions/config';
import { newProject } from 'actions/project';
import { raiseError } from 'actions/errors';
import { closeWindow, showSaveDialog } from 'utils/window';
import { writeFile } from 'utils/io';

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

const {
  updateApp,
  setStatusText,
  setActiveEntityId,
  setActiveReactorId,
  toggleState,
} = appStore.actions;

export { setStatusText, setActiveEntityId, setActiveReactorId, toggleState };

export default appStore.reducer;

export function exitApp() {
  closeWindow();
}

export function initApp() {
  function loadLicense() {
    return license.load(env.LICENSE_FILE);
  }

  function loadMenu() {
    const { setApplicationMenu, buildFromTemplate } = remote.Menu;
    const menu = [...menuConfig];

    function executeAction({ action }) {
      events.emit('menu-action', action);
    }

    menu.forEach(menuItem => {
      if (menuItem.submenu) {
        menuItem.submenu.forEach(item => {
          if (item.action && !item.role) {
            item.click = executeAction;
          }
        });
      }
    });

    setApplicationMenu(buildFromTemplate(menu));
  }

  return async (dispatch, getState) => {
    await loadLicense();
    await loadMenu();
    await dispatch(loadConfig());
    await dispatch(newProject());

    const { checkForUpdates } = getState().config;

    if (checkForUpdates) {
      updater.checkForUpdates();
    }
  };
}

export function saveImage(file) {
  return async dispatch => {
    const { filePath, canceled } = await showSaveDialog({ defaultPath: `image-${Date.now()}.png` });

    if (!canceled) {
      try {
        const data = renderer.getFrameData(false);

        stage.render(data);

        const buffer = stage.getImage();

        await writeFile(file, buffer);

        logger.log('Image saved:', filePath);
      } catch (error) {
        dispatch(raiseError('Failed to save image file.', error));
      }
    }
  };
}
