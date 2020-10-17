import create from 'zustand';
import { reactors } from 'global';
import appStore from './app';

const initialState = {
  reactors: [],
};

const reactorStore = create(() => ({
  ...initialState,
}));

export function loadReactors() {
  reactorStore.setState({ reactors: reactors.toJSON() });
}

export function resetReactors() {
  reactors.clearReactors();

  appStore.setState({ setActiveReactorId: null });
}

export function addReactor(reactor) {
  const newReactor = reactors.addReactor(reactor);

  loadReactors();

  return newReactor;
}

export function removeReactor(reactor) {
  reactors.removeReactor(reactor);

  loadReactors();
}

export function clearReactors() {
  reactors.clearReactors();

  loadReactors();
}

export default reactorStore;
