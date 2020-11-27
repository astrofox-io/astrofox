import ShaderPass from 'graphics/ShaderPass';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'graphics/blendModes';

export default class BlendPass extends ShaderPass {
  constructor(buffer) {
    super(BlendShader);

    this.buffer = buffer;
    this.blendMode = 'Normal';
    this.opacity = 1.0;
  }

  render(renderer, inputBuffer, outputBuffer) {
    const { opacity, blendMode } = this;

    this.setUniforms({
      baseBuffer: this.buffer,
      blendBuffer: inputBuffer.texture,
      mode: blendModes[blendMode],
      opacity,
    });

    super.render(renderer, inputBuffer, outputBuffer);
  }
}
