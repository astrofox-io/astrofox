import { createSlice } from '@reduxjs/toolkit';
import { stage } from 'view/global';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_BACKGROUND_COLOR,
} from 'view/constants';
import { clamp } from 'utils/math';

const initialState = {
  width: DEFAULT_CANVAS_WIDTH,
  height: DEFAULT_CANVAS_HEIGHT,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  zoom: 100,
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

export function updateZoom(value) {
  return (dispatch, getState) => {
    const {
      stage: { zoom },
    } = getState();

    dispatch(updateStage({ zoom: value === 0 ? 100 : clamp(zoom + value * 10, 10, 100) }));
  };
}

export function updateCanvas(width, height, backgroundColor) {
  return dispatch => {
    stage.setSize(width, height);
    dispatch(updateStage({ width, height, backgroundColor }));
  };
}
