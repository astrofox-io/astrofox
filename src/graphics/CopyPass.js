import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';

export default class CopyPass extends ShaderPass {
  constructor(buffer) {
    super(CopyShader);

    this.buffer = buffer;
    this.needsSwap = false;
    this.copyToBuffer = true;
  }

  dispose() {
    this.buffer.dispose();
  }

  render(renderer, inputBuffer) {
    const { copyToBuffer, buffer } = this;

    super.render(
      renderer,
      copyToBuffer ? inputBuffer : buffer,
      copyToBuffer ? buffer : inputBuffer,
    );
  }
}
