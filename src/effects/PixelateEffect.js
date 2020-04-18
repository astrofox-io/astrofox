import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import PixelateShader from 'shaders/PixelateShader';
import HexagonShader from 'shaders/HexagonShader';

const shaders = {
  Square: PixelateShader,
  Hexagon: HexagonShader,
};

export default class PixelateEffect extends Effect {
  static label = 'Pixelate';

  static className = 'PixelateEffect';

  static defaultOptions = {
    type: 'Square',
    size: 10,
  };

  constructor(properties) {
    super(PixelateEffect, properties);
  }

  update(properties) {
    const changed = Effect.prototype.update.call(this, properties);

    if (this.pass && properties.type !== undefined) {
      this.setPass(this.getShaderPass(this.properties.type));
    }

    return changed;
  }

  updatePass() {
    this.pass.setUniforms({ size: this.properties.size });
  }

  addToScene() {
    this.setPass(this.getShaderPass(this.properties.type));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }

  getShaderPass(type) {
    const pass = new ShaderPass(shaders[type]);
    const { width, height } = this.scene.getSize();

    pass.setUniforms(this.properties);
    pass.setSize(width, height);

    return pass;
  }
}
