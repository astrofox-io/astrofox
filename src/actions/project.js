import { createSlice } from '@reduxjs/toolkit';
import { api, env, logger, reactors, stage } from 'view/global';
import { updateCanvas } from 'actions/stage';
import { loadScenes, resetScenes } from 'actions/scenes';
import { loadReactors, resetReactors } from 'actions/reactors';
import { raiseError } from 'actions/errors';
import { showModal } from 'actions/modals';
import { contains } from 'utils/array';
import Entity from 'core/Entity';
import Stage from 'core/Stage';
import Scene from 'core/Scene';
import Display from 'core/Display';
import AudioReactor from 'audio/AudioReactor';
import * as displays from 'displays';
import * as effects from 'effects';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
} from 'view/constants';

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

const { updateProject, touchProject, resetProject } = projectStore.actions;

export { touchProject, resetProject };

export default projectStore.reducer;

export function loadProject(data) {
  function loadElement(scene, config) {
    const { name } = config;
    const type = displays[name] || effects[name];

    if (type) {
      const entity = Display.create(type, config);

      scene.addElement(entity);
    } else {
      logger.warn('Component not found:', name);
    }
  }

  return () => {
    logger.log('Loaded project:', data);

    stage.clearScenes();
    reactors.clearReactors();

    if (data.reactors) {
      data.reactors.forEach(config => {
        const reactor = Entity.create(AudioReactor, config);

        reactors.addReactor(reactor);
      });
    }

    if (data.scenes) {
      data.scenes.forEach(config => {
        const scene = Display.create(Scene, config);

        stage.addScene(scene);

        if (config.displays) {
          config.displays.forEach(display => loadElement(scene, display));
        }

        if (config.effects) {
          config.effects.forEach(effect => loadElement(scene, effect));
        }
      });
    }

    if (data.stage) {
      stage.update(data.stage.properties);
    } else {
      stage.update(Stage.defaultProperties);
    }
  };
}

export function newProject() {
  return async dispatch => {
    await dispatch(resetScenes());
    await dispatch(resetReactors());
    await dispatch(
      updateCanvas(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_BACKGROUND_COLOR),
    );

    const scene = stage.addScene();

    scene.addElement(new displays.ImageDisplay());
    scene.addElement(new displays.BarSpectrumDisplay());
    scene.addElement(new displays.TextDisplay({ text: 'hello.' }));

    dispatch(loadScenes());
    dispatch(loadReactors());
    dispatch(resetProject());
  };
}

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

export function loadProjectFile(file) {
  return async dispatch => {
    try {
      const data = await api.loadProjectFile(file);

      await dispatch(loadProject(data));
      await dispatch(loadScenes());
      await dispatch(updateProject({ file, opened: Date.now(), lastModified: 0 }));
    } catch (e) {
      return dispatch(raiseError('Invalid project file.', e));
    }
  };
}

export function saveProjectFile(file) {
  return async dispatch => {
    if (file) {
      const data = {
        version: env.APP_VERSION,
        stage: stage.toJSON(),
        scenes: stage.scenes.toJSON(),
        reactors: reactors.toJSON(),
      };

      try {
        await api.saveProjectFile(file, data);

        logger.log('Project saved:', file, data);

        dispatch(updateProject({ file, lastModified: 0 }));
      } catch (error) {
        dispatch(raiseError('Failed to save project file.', error));
      }
    } else {
      const { filePath, canceled } = await api.showSaveDialog({ defaultPath: 'project.afx' });

      if (!canceled) {
        dispatch(saveProjectFile(filePath));
      }
    }
  };
}

export function openProjectFile() {
  return async dispatch => {
    const { filePaths, canceled } = await api.showOpenDialog({
      filters: [{ name: 'Project files', extensions: ['afx'] }],
    });

    if (!canceled) {
      dispatch(loadProjectFile(filePaths[0]));
    }
  };
}
