import { createSlice } from '@reduxjs/toolkit';
import { stage } from 'view/global';
import { loadDisplays } from './displays';
import { loadEffects } from './effects';

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
    await dispatch(loadDisplays(scenes));
    await dispatch(loadEffects(scenes));
  };
}

export function updateSceneElement(id, prop, value) {
  return dispatch => {
    const element = stage.getElement(id);
    if (element) {
      element.update({ [prop]: value });
      dispatch(setScenes(stage.scenes));
    }
  };
}
