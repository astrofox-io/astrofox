import { updateExistingProps, resolve } from 'utils/object';
import { uniqueId } from 'utils/crypto';
import cloneDeep from 'lodash/cloneDeep';

export default class Entity {
  static create = (Type, config) => {
    const { id, name, properties, displays, effects, ...props } = config;

    const entity = new Type(properties);

    for (const [key, value] of Object.entries(props)) {
      entity[key] = value;
    }

    entity.id = id;

    return entity;
  };

  constructor(name, properties = {}) {
    this.id = uniqueId();
    this.name = name;
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
