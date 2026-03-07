// @ts-nocheck
import { Color, Mesh, OrthographicCamera, Scene } from "three";
import { getFullscreenGeometry } from "./common";

export default class Pass {
	constructor() {
		this.needsSwap = false;
		this.clearColor = false;
		this.clearDepth = false;
		this.clearStencil = false;
		this.renderToScreen = false;
		this.setClearColor = null;
		this.setClearAlpha = 1.0;
	}

	setFullscreen(material, geometry, camera) {
		this.scene = new Scene();
		this.camera = camera || new OrthographicCamera(-1, 1, 1, -1, 0, 1);
		this.geometry = geometry || getFullscreenGeometry();
		this.material = material;

		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;

		this.scene.add(this.mesh);
	}

	update(properties = {}) {
		for (const [key, value] of Object.entries(properties)) {
			this[key] = value;
		}
	}

	render(renderer, scene, camera, renderTarget) {
		const {
			clearColor,
			clearDepth,
			clearStencil,
			setClearColor,
			setClearAlpha,
			renderToScreen,
		} = this;

		const oldColor = new Color();
		const oldAlpha = renderer.getClearAlpha();

		if (setClearColor) {
			renderer.getClearColor(oldColor);
			renderer.setClearColor(setClearColor, setClearAlpha);
		}

		renderer.setRenderTarget(renderToScreen ? null : renderTarget);

		if (clearColor || clearDepth || clearStencil) {
			renderer.clear(clearColor, clearDepth, clearStencil);
		}

		renderer.render(scene, camera);

		if (setClearColor) {
			renderer.setClearColor(oldColor, oldAlpha);
		}
	}
}
