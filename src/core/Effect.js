import Display from 'core/Display';

export default class Effect extends Display {
  constructor(type, properties) {
    super(type, properties);

    Object.defineProperty(this, 'type', { value: 'fx' });
  }

  update(properties = {}) {
    const { pass } = this;
    const { enabled } = properties;

    if (pass && enabled !== undefined) {
      pass.properties.enabled = enabled;
    }

    return super.update(properties);
  }

  setPass(pass) {
    this.pass = pass;
    this.pass.properties.enabled = this.properties.enabled;

    this.scene.updatePasses();
  }

  updatePass() {
    this.pass.setUniforms(this.properties);
  }

  setSize(width, height) {
    const { pass } = this;

    if (pass) {
      pass.setSize(width, height);
    }
  }

  renderToScene() {
    if (this.hasUpdate) {
      this.updatePass();

      this.hasUpdate = false;
    }
  }
}
