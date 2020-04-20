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
    return dispatch(setScenes(stage.getSceneData()));
  };
}

export function addScene() {
  return dispatch => {
    stage.addScene();
    return dispatch(loadScenes());
  };
}

export function updateElement(id, prop, value) {
  return dispatch => {
    const element = stage.getElementById(id);

    if (element) {
      element.update({ [prop]: value });
      return dispatch(loadScenes());
    }
  };
}

export function removeElement(id) {
  return dispatch => {
    const element = stage.getElementById(id);

    if (element) {
      stage.removeElement(element);
    }

    return dispatch(loadScenes());
  };
}

export function moveElement(id, direction) {
  return dispatch => {
    const element = stage.getElementById(id);

    if (element) {
      if (element.type === DISPLAY_TYPE_SCENE && stage.shiftScene(element, direction)) {
        return dispatch(loadScenes());
      }

      const scene = stage.getElementById(element.scene.id);

      if (scene && scene.shiftElement(element, direction)) {
        return dispatch(loadScenes());
      }
    }
  };
}
