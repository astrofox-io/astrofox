import { createSlice } from '@reduxjs/toolkit';

const videoStore = createSlice({
  name: 'video',
  initialState: [],
  reducers: {
    updateVideo(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

const { updateVideo } = videoStore.actions;

export default videoStore.reducer;
