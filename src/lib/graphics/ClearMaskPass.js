import Pass from "@/graphics/Pass";

export default class ClearMaskPass extends Pass {
	render(renderer) {
		const { stencil } = renderer.state.buffers;

		stencil.setLocked(false);
		stencil.setTest(false);
	}
}
