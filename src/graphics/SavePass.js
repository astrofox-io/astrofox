import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';

export default class SavePass extends ShaderPass {
  static defaultOptions = {
    transparent: true,
    needsSwap: false,
    forceClear: true,
  };

  constructor(buffer, properties) {
    super(CopyShader, { ...SavePass.defaultOptions, ...properties });

    this.buffer = buffer;
  }

  render(renderer, writeBuffer, readBuffer) {
    super.render(renderer, this.buffer, readBuffer);
  }
}
