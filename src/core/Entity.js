import { updateExistingProps, resolve } from 'utils/object';
import { uniqueId } from 'utils/crypto';
import cloneDeep from 'lodash/cloneDeep';

export default class Entity {
  static create = (Type, config) => {
    const { id, name, properties, displays, effects, ...props } = config;

    const entity = new Type(properties);

    delete entity.id;

    for (const [key, value] of Object.entries(props)) {
      entity[key] = value;
    }

    Object.defineProperty(entity, 'id', { value: id, configurable: true });

    return entity;
  };

  constructor(name, properties = {}) {
    Object.defineProperty(this, 'id', { value: uniqueId(), configurable: true });
    Object.defineProperty(this, 'name', { value: name });

    this.properties = properties;
  }

  update(properties = {}) {
    return updateExistingProps(this.properties, resolve(properties, [this.properties]));
  }

  toString() {
    return `[${this.name} ${this.id}]`;
  }

  toJSON() {
    const { id, name, type, enabled, properties } = this;

    return {
      id,
      name,
      type,
      enabled,
      properties: cloneDeep(properties),
    };
  }
}
