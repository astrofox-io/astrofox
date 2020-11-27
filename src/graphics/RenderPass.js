import Pass from 'graphics/Pass';

export default class RenderPass extends Pass {
  constructor(scene, camera) {
    super();

    this.scene = scene;
    this.camera = camera;
  }

  render(renderer, inputBuffer) {
    const { scene, camera } = this;

    super.render(renderer, scene, camera, inputBuffer);
  }
}
