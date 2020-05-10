import { createSlice } from '@reduxjs/toolkit';
import { videoRenderer, player } from 'view/global';

const initialState = {
  rendering: false,
};

const videoStore = createSlice({
  name: 'video',
  initialState,
  reducers: {
    updateVideo(state, action) {
      return { ...state, ...action.payload };
    },
    startRender(state, action) {
      player.stop();
      videoRenderer.init(action.payload);
      videoRenderer.start();

      return { ...action.payload, rendering: true };
    },
    stopRender(state) {
      videoRenderer.stop();

      return { ...state, rendering: false };
    },
  },
});

export const { startRender, stopRender } = videoStore.actions;

export default videoStore.reducer;
