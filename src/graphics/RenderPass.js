import Pass from 'src/graphics/Pass';

export default class RenderPass extends Pass {
  static defaultProperties = {
    forceClear: true,
    overrideMaterial: null,
    setClearColor: null,
    setClearAlpha: 1.0,
  };

  constructor(scene, camera, properties) {
    super({ ...RenderPass.defaultProperties, ...properties });

    this.scene = scene;
    this.camera = camera;
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera, overrideMaterial } = this;

    if (overrideMaterial) {
      scene.overrideMaterial = overrideMaterial;
    }

    super.render(renderer, scene, camera, readBuffer);

    scene.overrideMaterial = null;
  }
}
