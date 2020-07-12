import { createSlice } from '@reduxjs/toolkit';
import { videoRenderer, player } from 'global';

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

      setTimeout(() => {
        videoRenderer.start();
      }, 500);

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
