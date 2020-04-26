import { createSlice } from '@reduxjs/toolkit';
import { raiseError } from 'actions/errors';
import { env, logger } from 'view/global';
import { fileExists, readFileCompressed, writeFileCompressed } from 'utils/io';
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

export const { setConfig } = configStore.actions;

export default configStore.reducer;

export function saveConfig(config) {
  return async dispatch => {
    try {
      const data = JSON.stringify(config);

      await writeFileCompressed(APP_CONFIG_FILE, data);

      logger.log('Config file saved:', APP_CONFIG_FILE, config);

      dispatch(setConfig(config));
    } catch (error) {
      dispatch(raiseError('Failed to save config file.', error));
    }
  };
}

export function loadConfig() {
  return async dispatch => {
    if (fileExists(APP_CONFIG_FILE)) {
      try {
        const data = await readFileCompressed(APP_CONFIG_FILE);
        const config = JSON.parse(data);

        logger.log('Config file loaded:', APP_CONFIG_FILE, config);

        dispatch(setConfig(config));
      } catch (error) {
        dispatch(raiseError('Failed to load config file.', error));
      }
    } else {
      dispatch(setConfig({ ...defaultAppConfig, uid: uniqueId() }));
    }
  };
}
