import Component from 'core/Component';
import AudioReactor from 'audio/AudioReactor';

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

    this.name = type.className;
    this.initialized = !!properties;
    this.scene = null;
    this.hasUpdate = false;
    this.changed = false;
    this.reactors = {};
  }

  getReactor(name) {
    return this.reactors[name];
  }

  setReactor(name, properties) {
    // Create reactor
    if (properties) {
      const { displayName } = this.properties;
      this.reactors[name] = new AudioReactor({
        displayName: `Reactor/${displayName}/${name}`,
        ...properties,
      });
    }
    // Remove reactor
    else {
      this.update({ [name]: this.reactors[name].properties.lastValue });
      delete this.reactors[name];
    }

    return this.reactors[name];
  }

  updateReactors(data) {
    const { reactors } = this;

    Object.keys(reactors).forEach(name => {
      const reactor = reactors[name];

      if (reactor) {
        const { output } = reactor.parse(data);
        const { min, max } = reactor.properties;
        const value = (max - min) * output + min;

        this.update({ [name]: value });
      }
    });
  }

  update(properties = {}) {
    this.hasUpdate = super.update(properties);

    if (!this.changed && this.hasUpdate) {
      this.changed = true;
    }

    return this.hasUpdate;
  }

  toJSON() {
    const { id, name, type, properties, reactors } = this;

    return {
      id,
      name,
      type,
      properties: { ...properties },
      reactors,
    };
  }
}
