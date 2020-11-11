import Entity from 'core/Entity';
import cloneDeep from 'lodash/cloneDeep';
import { getDisplayName } from '../utils/controls';

export default class Display extends Entity {
  static create = (Type, config) => {
    const { reactors = {} } = config;
    const entity = Entity.create(Type, config);

    for (const [key, value] of Object.entries(reactors)) {
      entity.setReactor(key, value);
    }

    return entity;
  };

  constructor(Type, properties) {
    const {
      config: { name, label, defaultProperties },
    } = Type;

    super(name, { ...defaultProperties, ...properties });

    this.type = 'display';
    this.displayName = getDisplayName(label);
    this.enabled = true;
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
    const properties = {};

    for (const [key, value] of Object.entries(reactors)) {
      const { id, min, max } = value;
      const output = data.reactors[id];

      if (output !== undefined) {
        properties[key] = (max - min) * output + min;
      }
    }

    this.update(properties);
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

  render() {}
}
