import { createSlice } from '@reduxjs/toolkit';
import { env, logger, stage, raiseError } from 'view/global';
import { readFile, readFileCompressed, writeFileCompressed } from 'utils/io';
import * as displayLibrary from '../displays';
import { loadScenes } from './scenes';

export const projectStore = createSlice({
  name: 'project',
  initialState: {
    file: '',
    changed: false,
  },
  reducers: {
    updateProject(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateProject } = projectStore.actions;

export default projectStore.reducer;

export function loadProject(file) {
  return dispatch => {
    const loadData = data => {
      stage.loadConfig(JSON.parse(data));
      stage.resetChanges();
      return dispatch(updateProject({ file, changed: false }));
    };

    return readFileCompressed(file)
      .then(loadData, error => {
        if (error.message.indexOf('incorrect header check') > -1) {
          readFile(file)
            .then(loadData)
            .catch(error => {
              return dispatch(raiseError('Invalid project file.', error));
            });
        } else {
          throw error;
        }
      })
      .catch(error => {
        return dispatch(raiseError('Invalid project file.', error));
      });
  };
}

export function saveProject(file) {
  return dispatch => {
    const sceneData = stage.scenes.map(scene => scene.toJSON());

    const data = JSON.stringify({
      version: env.APP_VERSION,
      stage: stage.toJSON(),
      scenes: sceneData,
    });

    return writeFileCompressed(file, data)
      .then(() => {
        logger.log('Project saved:', file);

        stage.resetChanges();

        return dispatch(updateProject({ file, changed: false }));
      })
      .catch(error => {
        return dispatch(raiseError('Failed to save project file.', error));
      });
  };
}

export function newProject() {
  return async dispatch => {
    stage.clearScenes();

    const scene = stage.addScene();

    scene.addElement(new displayLibrary.ImageDisplay());
    scene.addElement(new displayLibrary.BarSpectrumDisplay());
    scene.addElement(new displayLibrary.TextDisplay({ text: 'hello.' }));

    stage.resetChanges();

    await dispatch(loadScenes(stage.getSceneData()));

    return dispatch(updateProject({ file: '' }));
  };
}
