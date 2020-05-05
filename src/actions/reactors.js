import { createSlice } from '@reduxjs/toolkit';
import { reactors } from 'view/global';
import { setActiveReactorId } from './app';

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

const { setReactors } = reactorStore.actions;

export default reactorStore.reducer;

export function loadReactors() {
  return dispatch => {
    dispatch(setReactors(reactors.toJSON()));
  };
}

export function resetReactors() {
  return dispatch => {
    reactors.clearReactors();

    dispatch(setActiveReactorId(null));
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
