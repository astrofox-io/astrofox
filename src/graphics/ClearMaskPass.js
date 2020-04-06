import ComposerPass from 'graphics/ComposerPass';

export default class ClearMaskPass extends ComposerPass {
  constructor(options) {
    super(options);

    this.enabled = true;
  }

  render(renderer) {
    renderer.state.buffers.stencil.setTest(false);
  }
}
