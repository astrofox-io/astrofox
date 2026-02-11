import {
	LinearFilter,
	MeshBasicMaterial,
	OrthographicCamera,
	PlaneBufferGeometry,
} from "three";
import Pass from "./Pass";

export default class ImagePass extends Pass {
	constructor(texture, resolution) {
		super();

		const { width, height } = resolution;
		const mediaWidth =
			texture.image?.naturalWidth || texture.image?.videoWidth || texture.image?.width || 1;
		const mediaHeight =
			texture.image?.naturalHeight ||
			texture.image?.videoHeight ||
			texture.image?.height ||
			1;

		this.texture = texture;
		texture.minFilter = LinearFilter;

		const material = new MeshBasicMaterial({
			map: texture,
			depthTest: false,
			depthWrite: false,
			transparent: true,
		});

		const camera = new OrthographicCamera(
			width / -2,
			width / 2,
			height / 2,
			height / -2,
			0,
			1,
		);
		const geometry = new PlaneBufferGeometry(mediaWidth, mediaHeight);

		this.setFullscreen(material, geometry, camera);
	}

	render(renderer, inputBuffer) {
		const { scene, camera } = this;

		super.render(renderer, scene, camera, inputBuffer);
	}
}
