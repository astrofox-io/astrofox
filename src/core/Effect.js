import Display from 'core/Display';
import { DISPLAY_TYPE_EFFECT } from 'view/constants';

export default class Effect extends Display {
  constructor(type, properties) {
    super(type, properties);

    Object.defineProperty(this, 'type', { value: DISPLAY_TYPE_EFFECT });
  }

  update(properties = {}) {
    const { pass } = this;
    const { enabled } = properties;

    if (pass && enabled !== undefined) {
      pass.properties.enabled = enabled;
    }

    const changed = super.update(properties);

    if (changed) {
      this.updatePass();
    }

    return changed;
  }

  setPass(pass) {
    this.pass = pass;
    this.pass.properties.enabled = this.properties.enabled;

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

  renderToScene() {}
}
