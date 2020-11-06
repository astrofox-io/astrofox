import Display from 'core/Display';

export default class Effect extends Display {
  constructor(Type, properties) {
    super(Type, properties);

    Object.defineProperty(this, 'type', { value: 'effect', configurable: true });
  }

  update(properties = {}) {
    const changed = super.update(properties);

    if (changed) {
      this.updatePass();
    }

    return changed;
  }

  updatePass() {
    const { pass } = this;

    if (pass.setUniforms) {
      pass.setUniforms(this.properties);
    }
  }

  setSize(width, height) {
    const { pass } = this;

    if (pass) {
      pass.setSize(width, height);
    }
  }

  render() {}
}
