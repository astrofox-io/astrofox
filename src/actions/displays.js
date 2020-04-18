import { createSlice } from '@reduxjs/toolkit';

const displayStore = createSlice({
  name: 'displays',
  initialState: [],
  reducers: {
    setDisplays(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { setDisplays } = displayStore.actions;

export default displayStore.reducer;
