import { updateExistingProps } from 'utils/object';
import { uniqueId } from '../utils/crypto';

export default class Component {
  constructor(properties = {}) {
    Object.defineProperty(this, 'id', { value: uniqueId() });

    this.properties = properties;
  }

  update(properties = {}) {
    if (typeof properties === 'function') {
      return updateExistingProps(this.properties, properties(this.properties));
    }
    return updateExistingProps(this.properties, properties);
  }

  toString() {
    return this.id.toString();
  }
}
