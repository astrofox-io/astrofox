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
  showControlDock: true,
  showPlayer: true,
  showReactor: false,
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
  },
});

export const { updateApp } = appStore.actions;

export default appStore.reducer;

async function loadLicense() {
  await license.load(env.LICENSE_FILE);
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

export function exitApp() {
  closeWindow();
}

export function initApp() {
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

export function toggleState(prop) {
  return (dispatch, getState) => {
    const { app } = getState();
    dispatch(updateApp({ [prop]: !app[prop] }));
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

export function showActiveReactor(activeReactorId) {
  return dispatch => {
    dispatch(updateApp({ activeReactorId }));
  };
}

export function hideActiveReactor() {
  return dispatch => {
    dispatch(updateApp({ activeReactorId: null }));
  };
}
