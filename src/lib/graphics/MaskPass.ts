import Pass from "@/lib/graphics/Pass";

export default class MaskPass extends Pass {
	[key: string]: any;
	constructor(scene, camera) {
		super();

		this.scene = scene;
		this.camera = camera;
	}

	render(renderer, inputBuffer, outputBuffer) {
		const { context, state } = renderer;
		const { clear, inverse } = this.properties;
		const writeValue = inverse ? 0 : 1;
		const clearValue = inverse ? 1 : 0;

		// Don't update color or depth
		state.buffers.color.setMask(false);
		state.buffers.depth.setMask(false);

		// Lock buffers
		state.buffers.color.setLocked(true);
		state.buffers.depth.setLocked(true);

		// Set up stencil
		state.buffers.stencil.setTest(true);
		state.buffers.stencil.setOp(
			context.REPLACE,
			context.REPLACE,
			context.REPLACE,
		);
		state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
		state.buffers.stencil.setClear(clearValue);

		// Draw into the stencil buffer
		renderer.render(this.scene, this.camera, inputBuffer, clear);
		renderer.render(this.scene, this.camera, outputBuffer, clear);

		// Unlock color and depth buffer for subsequent rendering
		state.buffers.color.setLocked(false);
		state.buffers.depth.setLocked(false);

		// Only render where stencil is set to 1
		state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
		state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
	}
}
