import Entity from 'core/Entity';
import cloneDeep from 'lodash/cloneDeep';

let displayCount = {};

export function resetDisplayCount() {
  displayCount = {};
}

export default class Display extends Entity {
  constructor(type, properties) {
    if (displayCount[type.className] === undefined) {
      displayCount[type.className] = 1;
    } else {
      displayCount[type.className] += 1;
    }

    super({
      displayName: `${type.label} ${displayCount[type.className]}`,
      enabled: true,
      ...type.defaultProperties,
      ...properties,
    });

    Object.defineProperty(this, 'name', { value: type.className });

    this.scene = null;
    this.changed = false;
    this.reactors = {};
  }

  update(properties = {}) {
    this.changed = super.update(properties);

    return this.changed;
  }

  getReactor(name) {
    return this.reactors[name];
  }

  setReactor(reactor, name, min = 0, max = 1) {
    this.reactors[name] = { id: reactor.id, min, max };
  }

  removeReactor(name) {
    delete this.reactors[name];
  }

  clearReactors() {
    this.reactors = {};
  }

  updateReactors(data) {
    return;
    /*
    const { reactors, changed } = this;

    Object.keys(reactors).forEach(name => {
      const reactor = reactors[name];

      const { output } = reactor.parse(data);
      const { min, max } = reactor.properties;
      const value = (max - min) * output + min;

      this.update({ [name]: value });
    });

    this.changed = changed;
     */
  }

  toJSON() {
    const { id, name, type, properties, reactors } = this;

    return {
      id,
      name,
      type,
      properties: cloneDeep(properties),
      reactors: cloneDeep(reactors),
    };
  }
}
