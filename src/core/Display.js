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
    const {
      info: { name, label },
      defaultProperties,
    } = Type;
    let { displayName } = properties;

    if (!displayName) {
      if (displayCount[name] === undefined) {
        displayCount[name] = 1;
      } else {
        displayCount[name] += 1;
      }

      displayName = `${label || name} ${displayCount[name]}`;
    }

    super(name, {
      enabled: true,
      displayName,
      ...defaultProperties,
      ...properties,
    });

    this.scene = null;
    this.reactors = {};
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
    if (!data.hasUpdate) {
      return;
    }

    const { reactors } = this;

    Object.keys(reactors).forEach(prop => {
      const { id, min, max } = reactors[prop];
      const output = data.reactors[id];

      if (output !== undefined) {
        this.update({ [prop]: (max - min) * output + min });
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
