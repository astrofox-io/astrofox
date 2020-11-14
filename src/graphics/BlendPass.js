import { NormalBlending } from 'three';
import ShaderPass from 'graphics/ShaderPass';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'config/blendModes.json';

export default class BlendPass extends ShaderPass {
  static defaultProperties = {
    transparent: true,
    needsSwap: true,
    opacity: 1.0,
    blendMode: 'Normal',
    alpha: 1,
    blending: NormalBlending,
  };

  constructor(buffer, properties) {
    super(BlendShader, { ...BlendPass.defaultProperties, ...properties });

    this.buffer = buffer;
  }

  render(renderer, writeBuffer, readBuffer) {
    const { opacity, blendMode, alpha } = this;

    this.setUniforms({
      baseBuffer: this.buffer,
      blendBuffer: readBuffer.texture,
      mode: blendModes[blendMode],
      alpha,
      opacity,
    });

    this.mesh.material = this.material;

    super.render(renderer, writeBuffer, readBuffer);
  }
}
