import { MeshBasicMaterial } from "three";
import Pass from "./Pass";

export default class TexturePass extends Pass {
	constructor(texture) {
		super();

		this.texture = texture;

		this.material = new MeshBasicMaterial({
			map: texture,
			depthTest: false,
			depthWrite: false,
			transparent: true,
		});

		this.setFullscreen(this.material);
	}

	render(renderer, inputBuffer) {
		const { scene, camera, texture, alwaysUpdateTexture } = this;

		if (alwaysUpdateTexture) {
			texture.needsUpdate = true;
		}

		super.render(renderer, scene, camera, inputBuffer);
	}
}
