import { createSlice } from '@reduxjs/toolkit';
import { raiseError } from 'actions/errors';
import { api, env, logger } from 'view/global';
import { uniqueId } from 'utils/crypto';
import defaultAppConfig from 'config/app.json';

const { APP_CONFIG_FILE } = env;

const configStore = createSlice({
  name: 'config',
  initialState: defaultAppConfig,
  reducers: {
    setConfig(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const { setConfig } = configStore.actions;

export default configStore.reducer;

export function saveConfig(config) {
  return async dispatch => {
    try {
      await api.saveConfig(config);

      logger.log('Config file saved:', APP_CONFIG_FILE, config);

      dispatch(setConfig(config));
    } catch (error) {
      dispatch(raiseError('Failed to save config file.', error));
    }
  };
}

export function loadConfig() {
  return async dispatch => {
    try {
      const config = await api.loadConfig();

      if (config === null) {
        return dispatch(setConfig({ ...defaultAppConfig, uid: uniqueId() }));
      }

      logger.log('Config file loaded:', APP_CONFIG_FILE, config);

      dispatch(setConfig(config));
    } catch (error) {
      dispatch(raiseError('Failed to load config file.', error));
    }
  };
}
