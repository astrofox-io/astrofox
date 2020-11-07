import {
  NormalBlending,
  ShaderMaterial,
  Scene,
  OrthographicCamera,
  PlaneBufferGeometry,
  Mesh,
  UniformsUtils,
} from 'three';
import ComposerPass from 'graphics/ComposerPass';

export default class ShaderPass extends ComposerPass {
  static defaultProperties = {
    textureId: 'inputBuffer',
    transparent: false,
    needsSwap: true,
    forceClear: false,
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

    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.geometry = new PlaneBufferGeometry(2, 2);

    this.mesh = new Mesh(this.geometry, null);
    this.mesh.material = this.material;
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
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

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera, material, textureId } = this;

    if (readBuffer && material.uniforms[textureId]) {
      material.uniforms[textureId].value = readBuffer.texture;
    }

    super.render(renderer, scene, camera, writeBuffer);
  }
}
