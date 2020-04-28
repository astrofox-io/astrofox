import Component from 'core/Component';

let displayCount = {};

export function resetDisplayCount() {
  displayCount = {};
}

export default class Display extends Component {
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
    this.changed = false;
    this.reactors = {};
  }

  update(properties = {}) {
    this.changed = super.update(properties);

    return this.changed;
  }

  getReactor(name) {
    return this.reactors[name];
  }

  setReactor(name, reactor) {
    this.reactors[name] = reactor;
    this.changed = true;
  }

  removeReactor(name) {
    delete this.reactors[name];
    this.changed = true;
  }

  updateReactors(data) {
    const { reactors, changed } = this;

    Object.keys(reactors).forEach(name => {
      const reactor = reactors[name];

      const { output } = reactor.parse(data);
      const { min, max } = reactor.properties;
      const value = (max - min) * output + min;

      this.update({ [name]: value });
    });

    this.changed = changed;
  }

  toJSON() {
    const { id, name, type, properties, reactors } = this;

    const reactorData = Object.keys(reactors).reduce((obj, key) => {
      const reactor = reactors[key];
      obj[key] = reactor.id;
      return obj;
    }, {});

    return {
      id,
      name,
      type,
      properties: { ...properties },
      reactors: reactorData,
    };
  }
}
