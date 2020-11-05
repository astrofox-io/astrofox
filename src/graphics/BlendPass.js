import { NormalBlending } from 'three';
import ShaderPass from 'graphics/ShaderPass';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'config/blendModes.json';

export default class BlendPass extends ShaderPass {
  static info = {
    name: 'BlendPass',
    type: 'shader',
  };

  static defaultProperties = {
    transparent: true,
    needsSwap: true,
    opacity: 1.0,
    blendMode: 'Normal',
    alpha: 1,
    blending: NormalBlending,
    baseBuffer: true,
  };

  constructor(buffer, properties) {
    super(BlendShader, { ...BlendPass.defaultProperties, ...properties });

    this.buffer = buffer;
  }

  render(renderer, writeBuffer, readBuffer) {
    const { baseBuffer, opacity, blendMode, alpha } = this.properties;

    this.setUniforms({
      tBase: baseBuffer ? this.buffer : readBuffer.texture,
      tBlend: baseBuffer ? readBuffer.texture : this.buffer,
      mode: blendModes[blendMode],
      alpha,
      opacity,
    });

    this.mesh.material = this.material;

    super.render(renderer, writeBuffer, readBuffer);
  }
}
