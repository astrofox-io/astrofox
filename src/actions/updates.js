import { createSlice } from '@reduxjs/toolkit';
import semver from 'semver';
import { api, env, logger } from 'view/global';

const initialState = {
  status: null,
  checked: false,
  hasUpdate: false,
  downloadComplete: false,
  downloadProgress: 0,
  lastCheck: 0,
  updateInfo: null,
};

const appUpdateStore = createSlice({
  name: 'updates',
  initialState,
  reducers: {
    updateState(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

const { updateState } = appUpdateStore.actions;

export default appUpdateStore.reducer;

export function updateDownloadProgress(info) {
  return dispatch => {
    dispatch(updateState({ downloadProgress: info.percent }));
  };
}

export function downloadUpdate() {
  return async dispatch => {
    await dispatch(updateState({ status: 'downloading' }));

    const result = await api.invoke('download-update');

    logger.log('Update downloaded:', result);

    await dispatch(updateState({ downloadComplete: true, status: null }));
  };
}

export function quitAndInstall() {
  return async (dispatch, getState) => {
    const { downloadComplete } = getState().updates;

    if (downloadComplete) {
      await api.invoke('quit-and-install');
    }
  };
}

export function checkForUpdates() {
  return async (dispatch, getState) => {
    await dispatch(updateState({ status: 'checking', error: null, lastCheck: Date.now() }));

    try {
      const { updateInfo } = await api.invoke('check-for-updates');

      const hasUpdate = semver.gt(updateInfo.version, env.APP_VERSION);
      const { config } = getState();
      const status = config.autoUpdate && hasUpdate ? 'downloading' : null;

      logger.log('Update check complete:', updateInfo);

      await dispatch(updateState({ checked: true, status, updateInfo, hasUpdate }));

      if (config.autoUpdate && hasUpdate) {
        dispatch(downloadUpdate());
      }
    } catch (e) {
      dispatch(updateState({ status: 'error' }));

      logger.error('Update check failed:', e);
    }
  };
}

export function resetUpdates() {
  return dispatch => {
    dispatch(updateState({ status: null, error: null }));
  };
}
