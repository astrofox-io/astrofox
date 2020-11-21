import Pass from 'graphics/Pass';

export default class RenderPass extends Pass {
  static defaultProperties = {
    setClearColor: null,
    setClearAlpha: 1.0,
  };

  constructor(properties) {
    super({ ...RenderPass.defaultProperties, ...properties });
  }

  render(renderer, inputBuffer) {
    const { scene, camera } = this;

    super.render(renderer, scene, camera, inputBuffer);
  }
}
