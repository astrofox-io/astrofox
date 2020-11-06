import ComposerPass from 'graphics/ComposerPass';

export default class ClearMaskPass extends ComposerPass {
  render(renderer) {
    renderer.state.buffers.stencil.setTest(false);
  }
}
