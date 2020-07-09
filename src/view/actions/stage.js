import { createSlice } from '@reduxjs/toolkit';
import { stage } from 'global';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_BGCOLOR,
} from 'view/constants';
import { clamp } from 'utils/math';

const initialState = {
  width: DEFAULT_CANVAS_WIDTH,
  height: DEFAULT_CANVAS_HEIGHT,
  backgroundColor: DEFAULT_CANVAS_BGCOLOR,
  zoom: 100,
  loading: false,
};

const stageStore = createSlice({
  name: 'stage',
  initialState,
  reducers: {
    updateStage(state, action) {
      return { ...state, ...action.payload };
    },
    setZoom(state, action) {
      state.zoom = action.payload;
      return state;
    },
    setLoading(state, action) {
      state.loading = action.payload;
      return state;
    },
  },
});

const { updateStage, setZoom, setLoading } = stageStore.actions;

export { setZoom, setLoading };

export default stageStore.reducer;

export function updateZoom(value) {
  return (dispatch, getState) => {
    const { zoom } = getState().stage;
    const newValue = value === 0 ? 100 : clamp(zoom + value * 10, 10, 100);

    if (newValue !== zoom) {
      dispatch(setZoom(newValue));
    }
  };
}

export function updateCanvas(width, height, backgroundColor) {
  return dispatch => {
    stage.update({ width, height, backgroundColor });

    dispatch(updateStage({ width, height, backgroundColor }));
  };
}
