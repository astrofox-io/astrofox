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
  return dispatch => {
    const data = JSON.stringify(config);

    writeFileCompressed(APP_CONFIG_FILE, data)
      .then(() => {
        logger.log('Config file saved:', APP_CONFIG_FILE, config);

        dispatch(setConfig(config));
      })
      .catch(error => {
        dispatch(raiseError('Failed to save config file.', error));
      });
  };
}

export function loadConfig() {
  return dispatch => {
    if (fileExists(APP_CONFIG_FILE)) {
      readFileCompressed(APP_CONFIG_FILE)
        .then(data => {
          const config = JSON.parse(data);

          logger.log('Config file loaded:', APP_CONFIG_FILE, config);

          dispatch(setConfig(config));
        })
        .catch(error => {
          dispatch(raiseError('Failed to load config file.', error));
        });
    }

    dispatch(setConfig({ ...defaultAppConfig, uid: uniqueId() }));
  };
}
