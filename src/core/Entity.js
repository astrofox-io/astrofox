import { updateExistingProps } from 'utils/object';
import { uniqueId } from 'utils/crypto';
import cloneDeep from 'lodash/cloneDeep';

export default class Entity {
  constructor(name, properties = {}) {
    Object.defineProperty(this, 'id', { value: uniqueId() });
    Object.defineProperty(this, 'name', { value: name });

    this.properties = properties;
  }

  update(properties = {}) {
    if (typeof properties === 'function') {
      return updateExistingProps(this.properties, properties(this.properties));
    }
    return updateExistingProps(this.properties, properties);
  }

  toString() {
    return `[${this.name} ${this.id}]`;
  }

  toJSON() {
    const { id, name, properties } = this;

    return {
      id,
      name,
      properties: cloneDeep(properties),
    };
  }
}
