import Display from 'core/Display';

export default class Effect extends Display {
  constructor(info, properties) {
    super(info, properties);

    this.type = 'effect';
  }

  update(properties = {}) {
    const { pass } = this;
    const { enabled } = properties;

    if (pass && enabled !== undefined) {
      pass.enabled = enabled;
    }

    const changed = super.update(properties);

    if (changed) {
      this.updatePass();
    }

    return changed;
  }

  setPass(pass) {
    this.pass = pass;
    this.pass.enabled = this.enabled;

    this.scene.updatePasses();
  }

  updatePass() {
    if (this.pass.setUniforms) {
      this.pass.setUniforms(this.properties);
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
