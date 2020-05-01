import AudioReactor from 'audio/AudioReactor';
import { remove } from 'utils/array';

let reactorCount = 0;

export function resetReactorCount() {
  reactorCount = 0;
}

export default class Reactors {
  constructor() {
    this.reactors = [];
  }

  getReactorById(id) {
    return this.reactors.find(e => e.id === id);
  }

  getReactors() {
    return this.reactors;
  }

  addReactor(reactor) {
    reactorCount += 1;

    if (!reactor) {
      reactor = new AudioReactor({ displayName: `Reactor ${reactorCount}` });
    }

    this.reactors.push(reactor);

    return reactor;
  }

  removeReactor(reactor) {
    remove(this.reactors, reactor);
  }

  clearReactors() {
    this.reactors = [];

    resetReactorCount();
  }

  updateReactors(data) {
    this.reactors.forEach(reactor => reactor.parse(data));
  }

  toJSON() {
    return this.reactors.map(reactor => reactor.toJSON());
  }
}
