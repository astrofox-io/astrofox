import { createSlice } from '@reduxjs/toolkit';
import { stage } from 'view/global';

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

export function loadScenes(scenes) {
  return async dispatch => {
    await dispatch(setScenes(scenes));
  };
}

export function updateElement(id, prop, value) {
  return dispatch => {
    const element = stage.getElementById(id);
    if (element) {
      element.update({ [prop]: value });
      dispatch(setScenes(stage.getSceneData()));
    }
  };
}

export function removeElement(id) {
  return dispatch => {
    const element = stage.getElementById(id);
    if (element) {
      stage.removeElement(element);
    }
    dispatch(setScenes(stage.getSceneData()));
  };
}

export function addScene() {
  return dispatch => {
    stage.addScene();
    dispatch(setScenes(stage.getSceneData()));
  };
}
