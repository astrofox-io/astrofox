import Entity from 'core/Entity';
import cloneDeep from 'lodash/cloneDeep';

let displayCount = {};

export function resetDisplayCount() {
  displayCount = {};
}

export default class Display extends Entity {
  static create = (Type, config) => {
    const { reactors = {} } = config;
    const entity = Entity.create(Type, config);

    Object.keys(reactors).forEach(key => {
      const config = reactors[key];
      entity.setReactor(key, config);
    });

    return entity;
  };

  constructor(Type, properties = {}) {
    const { className, label, defaultProperties } = Type;
    let { displayName } = properties;

    if (!displayName) {
      if (displayCount[className] === undefined) {
        displayCount[className] = 1;
      } else {
        displayCount[className] += 1;
      }

      displayName = `${label || className} ${displayCount[className]}`;
    }

    super(Type.className, {
      enabled: true,
      ...defaultProperties,
      ...properties,
      displayName,
    });

    this.scene = null;
    this.reactors = {};
  }

  update(properties = {}) {
    return super.update(properties);
  }

  getReactor(prop) {
    return this.reactors[prop];
  }

  setReactor(prop, config) {
    this.reactors[prop] = config;
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
