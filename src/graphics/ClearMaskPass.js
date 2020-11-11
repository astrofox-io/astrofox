import Pass from 'src/graphics/Pass';

export default class ClearMaskPass extends Pass {
  render(renderer) {
    renderer.state.buffers.stencil.setTest(false);
  }
}
