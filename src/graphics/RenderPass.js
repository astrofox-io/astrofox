import ComposerPass from 'graphics/ComposerPass';

export default class RenderPass extends ComposerPass {
  static defaultOptions = {
    forceClear: true,
    overrideMaterial: null,
    setClearColor: null,
    setClearAlpha: 1.0,
  };

  constructor(scene, camera, options) {
    super({ ...RenderPass.defaultOptions, ...options });

    this.scene = scene;
    this.camera = camera;
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera } = this;
    const { overrideMaterial } = this.options;

    if (overrideMaterial) {
      scene.overrideMaterial = overrideMaterial;
    }

    super.render(renderer, scene, camera, readBuffer);

    scene.overrideMaterial = null;
  }
}
