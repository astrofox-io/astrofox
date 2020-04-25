import { createSlice } from '@reduxjs/toolkit';
import { stage } from 'view/global';
import { DISPLAY_TYPE_SCENE } from 'view/constants';

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

export const { setScenes } = sceneStore.actions;

export default sceneStore.reducer;

export function loadScenes() {
  return dispatch => {
    dispatch(setScenes(stage.getSceneData()));
  };
}

export function addScene() {
  return dispatch => {
    stage.addScene();
    dispatch(loadScenes());
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
    const element = stage.getElementById(id);

    if (element) {
      element.update({ [prop]: value });
      dispatch(loadScenes());
    }
  };
}

export function removeElement(id) {
  return dispatch => {
    const element = stage.getElementById(id);

    if (element) {
      stage.removeElement(element);
    }

    dispatch(loadScenes());
  };
}

export function moveElement(id, direction) {
  return dispatch => {
    const element = stage.getElementById(id);

    if (element) {
      if (element.type === DISPLAY_TYPE_SCENE && stage.shiftScene(element, direction)) {
        dispatch(loadScenes());
      }

      const scene = stage.getElementById(element.scene.id);

      if (scene && scene.shiftElement(element, direction)) {
        dispatch(loadScenes());
      }
    }
  };
}
