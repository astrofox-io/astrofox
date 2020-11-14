import { NormalBlending, ShaderMaterial, UniformsUtils } from 'three';
import Pass from './Pass';

export default class ShaderPass extends Pass {
  static defaultProperties = {
    textureId: 'inputBuffer',
    transparent: false,
    needsSwap: true,
    blending: NormalBlending,
  };

  constructor(shader, properties) {
    super({ ...ShaderPass.defaultProperties, ...properties });

    const { uniforms = {}, defines = {}, vertexShader, fragmentShader } = shader;
    const { transparent, blending } = this;

    this.uniforms = UniformsUtils.clone(uniforms);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      defines: { ...defines },
      vertexShader,
      fragmentShader,
      transparent,
      blending,
    });

    this.setFullscreen(this.material);
  }

  setUniforms(properties = {}) {
    const { uniforms } = this;

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

    this.material.needsUpdate = true;
  }

  setSize(width, height) {
    this.setUniforms({ resolution: [width, height] });
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera, material, textureId } = this;

    if (readBuffer && material.uniforms[textureId]) {
      material.uniforms[textureId].value = readBuffer.texture;
    }

    super.render(renderer, scene, camera, writeBuffer);
  }
}
