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
    this.reactors = {};
  }

  update(properties = {}) {
    return super.update(properties);
  }

  getReactor(prop) {
    return this.reactors[prop];
  }

  setReactor(reactor, prop, min = 0, max = 1) {
    this.reactors[prop] = { id: reactor.id, min, max };
  }

  removeReactor(prop) {
    delete this.reactors[prop];
  }

  clearReactors() {
    this.reactors = {};
  }

  updateReactors(data) {
    const { reactors } = this;

    Object.keys(reactors).forEach(prop => {
      const reactor = reactors[prop];
      const output = data.reactors[reactor.id];

      if (output !== undefined) {
        const { min, max } = reactor;
        const value = (max - min) * output + min;

        this.update({ [prop]: value });
      }
    });
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
