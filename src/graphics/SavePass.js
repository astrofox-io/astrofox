import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';

export default class SavePass extends ShaderPass {
  static defaultProperties = {
    transparent: true,
    needsSwap: false,
    forceClear: true,
  };

  constructor(buffer, properties) {
    super(CopyShader, { ...SavePass.defaultProperties, ...properties });

    this.buffer = buffer;
  }

  render(renderer, writeBuffer, readBuffer) {
    super.render(renderer, this.buffer, readBuffer);
  }
}
