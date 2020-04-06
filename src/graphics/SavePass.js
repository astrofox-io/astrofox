import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';

export default class SavePass extends ShaderPass {
  static defaultOptions = {
    transparent: true,
    needsSwap: false,
    forceClear: true,
  };

  constructor(buffer, options) {
    super(CopyShader, { ...SavePass.defaultOptions, ...options });

    this.buffer = buffer;
  }

  render(renderer, writeBuffer, readBuffer) {
    super.render(renderer, this.buffer, readBuffer);
  }
}
