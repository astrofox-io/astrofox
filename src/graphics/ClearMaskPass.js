import ComposerPass from 'graphics/ComposerPass';

export default class ClearMaskPass extends ComposerPass {
  constructor(properties) {
    super(properties);

    this.enabled = true;
  }

  render(renderer) {
    renderer.state.buffers.stencil.setTest(false);
  }
}
