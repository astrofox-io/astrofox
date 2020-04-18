import { remote } from 'electron';
import { createSlice } from '@reduxjs/toolkit';
import { env, events, updater, license } from 'view/global';
import menuConfig from 'view/config/menu';
import { closeWindow } from 'utils/window';
import { loadConfig } from './config';
import { newProject } from './project';

const initialState = {
  audioFile: '',
  videoFile: '',
  projectFile: '',
  statusText: '',
  modals: [],
  reactor: null,
  showControlDock: true,
  showPlayer: true,
  showReactor: false,
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

async function loadMenu() {
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

export function exit() {
  closeWindow();
}

export function initApp() {
  return async (dispatch, getState) => {
    await license.load(env.LICENSE_FILE);
    await loadMenu();
    await dispatch(loadConfig());
    await dispatch(newProject());

    const { checkForUpdates } = getState().config;
    if (checkForUpdates) {
      updater.checkForUpdates();
    }
  };
}