import Entity from 'core/Entity';
import cloneDeep from 'lodash/cloneDeep';
import { getDisplayName } from '../utils/controls';

export default class Display extends Entity {
  static create = (Type, config) => {
    const { reactors = {} } = config;
    const entity = Entity.create(Type, config);

    Object.keys(reactors).forEach(key => {
      const reactorConfig = reactors[key];
      entity.setReactor(key, reactorConfig);
    });

    return entity;
  };

  constructor(Type, properties) {
    const {
      config: { name, label, defaultProperties },
    } = Type;

    super(name, { ...defaultProperties, ...properties });

    Object.defineProperties(this, {
      type: { value: 'display', configurable: true },
      displayName: { value: getDisplayName(label), writable: true },
      enabled: { value: true, writable: true },
      scene: { value: null, writable: true },
      reactors: { value: {}, writable: true },
    });
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
    const { id, name, type, enabled, displayName, properties, reactors } = this;

    return {
      id,
      name,
      type,
      enabled,
      displayName,
      properties: cloneDeep(properties),
      reactors: cloneDeep(reactors),
    };
  }
}
