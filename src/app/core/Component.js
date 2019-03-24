let id = 0;

export default class Component {
  constructor(options = {}) {
    id += 1;

    Object.defineProperty(this, 'id', { value: id });

    this.options = options;
  }

  update(options = {}) {
    let changed = false;

    Object.keys(options).forEach(key => {
      if (
        Object.prototype.hasOwnProperty.call(this.options, key) &&
        this.options[key] !== options[key]
      ) {
        this.options[key] = options[key];
        changed = true;
      }
    });

    return changed;
  }

  toString() {
    return this.id.toString();
  }
}
