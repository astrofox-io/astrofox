import create from 'zustand';
import { reactors } from 'global';

const initialState = {
  reactors: [],
  activeReactor: null,
};

const reactorStore = create(() => ({
  ...initialState,
}));

export function setActiveReactor(reactor) {
  reactorStore.setState({ activeReactor: reactor });
}

export function loadReactors() {
  reactorStore.setState({ reactors: reactors.toJSON() });
}

export function resetReactors() {
  reactors.clearReactors();

  setActiveReactor(null);
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
