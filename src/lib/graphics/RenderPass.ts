import Pass from "@/lib/graphics/Pass";

export default class RenderPass extends Pass {
	[key: string]: any;
	constructor(scene, camera) {
		super();

		this.scene = scene;
		this.camera = camera;
	}

	render(renderer, inputBuffer, outputBuffer) {
		const { scene, camera } = this;

		super.render(renderer, scene, camera, outputBuffer);
	}
}
