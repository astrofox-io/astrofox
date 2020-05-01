import { createSlice } from '@reduxjs/toolkit';
import { reactors } from 'view/global';

const reactorStore = createSlice({
  name: 'reactors',
  initialState: [],
  reducers: {
    setReactors(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { setReactors } = reactorStore.actions;

export default reactorStore.reducer;

export function loadReactors() {
  return dispatch => {
    dispatch(setReactors(reactors.toJSON()));
  };
}

export function addReactor(reactor) {
  return dispatch => {
    const newReactor = reactors.addReactor(reactor);

    dispatch(loadReactors());

    return newReactor;
  };
}

export function removeReactor(reactor) {
  return dispatch => {
    reactors.removeReactor(reactor);

    dispatch(loadReactors());
  };
}

export function clearReactors() {
  return dispatch => {
    reactors.clearReactors();

    dispatch(loadReactors());
  };
}
