import { createSlice } from '@reduxjs/toolkit';

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
