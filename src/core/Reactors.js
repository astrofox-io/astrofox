import AudioReactor, { resetReactorCount } from 'audio/AudioReactor';
import EntityList from 'core/EntityList';

export default class Reactors extends EntityList {
  addReactor(reactor) {
    return this.addElement(reactor ?? new AudioReactor());
  }

  removeReactor(reactor) {
    this.removeElement(reactor);
  }

  clearReactors() {
    this.clear();

    resetReactorCount();
  }

  updateReactors(data) {
    return this.reduce((memo, reactor) => {
      memo[reactor.id] = reactor.parse(data).output;
      return memo;
    }, {});
  }
}
