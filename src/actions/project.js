import { createSlice } from '@reduxjs/toolkit';
import { env, logger, stage } from 'view/global';
import * as displayLibrary from 'displays';
import { loadScenes } from 'actions/scenes';
import { raiseError } from 'actions/errors';
import { showModal } from 'actions/modals';
import { readFile, readFileCompressed, writeFileCompressed } from 'utils/io';
import { showOpenDialog, showSaveDialog } from 'utils/window';

export const projectStore = createSlice({
  name: 'project',
  initialState: {
    file: '',
  },
  reducers: {
    updateProject(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateProject } = projectStore.actions;

export default projectStore.reducer;

export function checkUnsavedChanges(menuAction, action) {
  return dispatch => {
    if (stage.hasChanges()) {
      dispatch(
        showModal('UnsavedChangesDialog', { showCloseButton: false }, { action: menuAction }),
      );
    } else {
      dispatch(action);
    }
  };
}

export function loadProject(file) {
  return dispatch => {
    function loadData(data) {
      stage.loadConfig(JSON.parse(data));
      stage.resetChanges();

      dispatch(loadScenes());
      dispatch(updateProject({ file }));
    }

    function handleError(error) {
      dispatch(raiseError('Invalid project file.', error));
    }

    return readFileCompressed(file)
      .then(loadData, error => {
        if (error.message.indexOf('incorrect header check') > -1) {
          readFile(file).then(loadData).catch(handleError);
        } else {
          throw error;
        }
      })
      .catch(handleError);
  };
}

export function saveProject(file) {
  return dispatch => {
    if (file) {
      const data = JSON.stringify({
        version: env.APP_VERSION,
        stage: stage.toJSON(),
        scenes: stage.getSceneData(),
      });

      writeFileCompressed(file, data)
        .then(() => {
          logger.log('Project saved:', file);

          stage.resetChanges();

          dispatch(updateProject({ file, changed: false }));
        })
        .catch(error => {
          dispatch(raiseError('Failed to save project file.', error));
        });
    } else {
      showSaveDialog({ defaultPath: 'project.afx' }).then(({ filePath, canceled }) => {
        if (!canceled) {
          dispatch(saveProject(filePath));
        }
      });
    }
  };
}

export function openProject() {
  return dispatch => {
    showOpenDialog({
      filters: [{ name: 'Project files', extensions: ['afx'] }],
    }).then(({ filePaths }) => {
      if (filePaths) {
        dispatch(loadProject(filePaths[0]));
      }
    });
  };
}

export function newProject() {
  return dispatch => {
    stage.clearScenes();

    const scene = stage.addScene();

    // scene.addElement(new displayLibrary.ImageDisplay());
    scene.addElement(new displayLibrary.BarSpectrumDisplay());
    scene.addElement(new displayLibrary.TextDisplay({ text: 'hello.' }));

    stage.resetChanges();

    dispatch(loadScenes());
    dispatch(updateProject({ file: '' }));
  };
}
