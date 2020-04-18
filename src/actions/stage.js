import { createSlice } from '@reduxjs/toolkit';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BACKGROUND_COLOR } from 'view/constants';

const initialState = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: BACKGROUND_COLOR,
  zoom: 1.0,
  loading: false,
  rendering: false,
};

const stageStore = createSlice({
  name: 'stage',
  initialState,
  reducers: {
    updateStage(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateStage } = stageStore.actions;

export default stageStore.reducer;
