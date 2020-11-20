import { ShaderMaterial, UniformsUtils } from 'three';
import Pass from './Pass';

export default class ShaderPass extends Pass {
  static defaultProperties = {
    needsSwap: true,
  };

  constructor(shader, properties) {
    super({ ...ShaderPass.defaultProperties, ...properties });

    const { uniforms = {}, defines = {}, vertexShader, fragmentShader } = shader;
    const { transparent, blending } = this;

    this.material = new ShaderMaterial({
      uniforms: UniformsUtils.clone(uniforms),
      defines: { ...defines },
      vertexShader,
      fragmentShader,
      transparent,
      blending,
    });

    this.setFullscreenMaterial(this.material);
  }

  setUniforms(properties = {}) {
    const { uniforms } = this.material;

    for (const [key, value] of Object.entries(properties)) {
      if (uniforms[key] !== undefined) {
        const item = uniforms[key].value;

        if (item?.set) {
          item.set(...value);
        } else {
          uniforms[key].value = value;
        }
      }
    }
  }

  setSize(width, height) {
    this.setUniforms({ resolution: [width, height] });
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera, material } = this;

    if (readBuffer && material.uniforms.inputBuffer) {
      material.uniforms.inputBuffer.value = readBuffer.texture;
    }

    super.render(renderer, scene, camera, writeBuffer);
  }
}
