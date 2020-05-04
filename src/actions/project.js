import { createSlice } from '@reduxjs/toolkit';
import { env, logger, reactors, stage } from 'view/global';
import * as displayLibrary from 'displays';
import { loadScenes } from 'actions/scenes';
import { raiseError } from 'actions/errors';
import { showModal } from 'actions/modals';
import { readFile, readFileCompressed, writeFileCompressed } from 'utils/io';
import { showOpenDialog, showSaveDialog } from 'utils/window';
import { contains } from 'utils/array';

const initialState = {
  file: '',
  opened: 0,
  lastModified: 0,
};

export const projectStore = createSlice({
  name: 'project',
  initialState,
  reducers: {
    updateProject(state, action) {
      return { ...state, ...action.payload };
    },
    touchProject(state) {
      state.lastModified = Date.now();
      return state;
    },
    resetProject() {
      return initialState;
    },
  },
  extraReducers: {
    'scenes/setScenes': state => {
      state.lastModified = Date.now();
      return state;
    },
    'stage/updateStage': (state, action) => {
      const keys = Object.keys(action.payload);
      if (contains(keys, ['width', 'height', 'backgroundColor'])) {
        state.lastModified = Date.now();
      }
      return state;
    },
  },
});

export const { updateProject, touchProject, resetProject } = projectStore.actions;

export default projectStore.reducer;

export function checkUnsavedChanges(menuAction, action) {
  return (dispatch, getState) => {
    const { opened, lastModified } = getState().project;

    if (lastModified > opened) {
      dispatch(
        showModal('UnsavedChangesDialog', { showCloseButton: false }, { action: menuAction }),
      );
    } else {
      dispatch(action);
    }
  };
}

export function loadProject(file) {
  return async dispatch => {
    function loadData(data) {
      stage.loadConfig(JSON.parse(data));

      dispatch(loadScenes());
      dispatch(updateProject({ file, opened: Date.now(), lastModified: 0 }));
    }

    function handleError(error) {
      dispatch(raiseError('Invalid project file.', error));
    }

    try {
      const data = await readFileCompressed(file);

      loadData(data);
    } catch (error) {
      if (error.message.indexOf('incorrect header check') > -1) {
        const data = await readFile(file);

        loadData(data).catch(handleError);
      } else {
        handleError(error);
      }
    }
  };
}

export function saveProject(file) {
  return async dispatch => {
    if (file) {
      const data = JSON.stringify({
        version: env.APP_VERSION,
        stage: stage.toJSON(),
        scenes: stage.scenes.toJSON(),
        reactors: reactors.toJSON(),
      });

      try {
        await writeFileCompressed(file, data);

        logger.log('Project saved:', file);

        dispatch(updateProject({ file, lastModified: 0 }));
      } catch (error) {
        dispatch(raiseError('Failed to save project file.', error));
      }
    } else {
      const { filePath, canceled } = await showSaveDialog({ defaultPath: 'project.afx' });

      if (!canceled) {
        dispatch(saveProject(filePath));
      }
    }
  };
}

export function openProject() {
  return async dispatch => {
    const { filePaths, canceled } = await showOpenDialog({
      filters: [{ name: 'Project files', extensions: ['afx'] }],
    });

    if (!canceled) {
      dispatch(loadProject(filePaths[0]));
    }
  };
}

export function newProject() {
  return dispatch => {
    stage.clearScenes();

    const scene = stage.addScene();

    scene.addElement(new displayLibrary.ImageDisplay());
    scene.addElement(new displayLibrary.BarSpectrumDisplay());
    scene.addElement(new displayLibrary.TextDisplay({ text: 'hello.' }));

    dispatch(loadScenes());
    dispatch(resetProject());
  };
}
