import { createSlice } from '@reduxjs/toolkit';

const effectStore = createSlice({
  name: 'effects',
  initialState: [],
  reducers: {
    setEffects(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { setEffects } = effectStore.actions;

export default effectStore.reducer;
