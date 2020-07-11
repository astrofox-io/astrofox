import { createSlice } from '@reduxjs/toolkit';
import { stage } from 'global';
import { setActiveEntityId } from './app';

const sceneStore = createSlice({
  name: 'scenes',
  initialState: [],
  reducers: {
    setScenes(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const { setScenes } = sceneStore.actions;

export default sceneStore.reducer;

export function loadScenes() {
  return dispatch => {
    dispatch(setScenes(stage.scenes.toJSON()));
  };
}

export function resetScenes() {
  return dispatch => {
    stage.clearScenes();

    dispatch(setActiveEntityId(null));
  };
}

export function addScene() {
  return dispatch => {
    const scene = stage.addScene();

    dispatch(loadScenes());

    return scene;
  };
}

export function addElement(element, sceneId) {
  return dispatch => {
    const scene = sceneId ? stage.getSceneById(sceneId) : stage.scenes[0];

    if (scene) {
      scene.addElement(element);
    }

    dispatch(loadScenes());
  };
}

export function updateElement(id, prop, value) {
  return dispatch => {
    const element = stage.getStageElementById(id);

    if (element) {
      element.update({ [prop]: value });
      dispatch(loadScenes());
    }
  };
}

export function removeElement(id) {
  return dispatch => {
    const element = stage.getStageElementById(id);

    if (element) {
      stage.removeStageElement(element);
      dispatch(loadScenes());
    }
  };
}

export function moveElement(id, spaces) {
  return dispatch => {
    const element = stage.getStageElementById(id);

    if (element) {
      stage.shiftStageElement(element, spaces);
      dispatch(loadScenes());
    }
  };
}
