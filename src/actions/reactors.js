import { createSlice } from '@reduxjs/toolkit';
import { renderer } from 'view/global';

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
    dispatch(setReactors(renderer.reactors.map(e => e.toJSON())));
  };
}

export function addReactor(reactor) {
  return dispatch => {
    const newReactor = renderer.addReactor(reactor);

    dispatch(loadReactors());

    return newReactor;
  };
}

export function removeReactor(reactor) {
  return dispatch => {
    renderer.removeReactor(reactor);

    dispatch(loadReactors());
  };
}

export function clearReactors() {
  return dispatch => {
    renderer.clearReactors();

    dispatch(loadReactors());
  };
}
