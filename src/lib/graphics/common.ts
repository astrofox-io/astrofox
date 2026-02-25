import {
	BufferAttribute,
	BufferGeometry,
	WebGLRenderTarget,
	WebGLRenderer,
} from "three";

let renderer = null;
let geometry = null;

export function getRenderer(canvas) {
	if (!renderer || (canvas && renderer.domElement !== canvas)) {
		renderer = new WebGLRenderer({
			canvas,
			antialias: false,
			premultipliedAlpha: true,
			alpha: false,
		});

		renderer.autoClear = false;
	}

	return renderer;
}

export function getFullscreenGeometry() {
	if (!geometry) {
		const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
		const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

		geometry = new BufferGeometry();

		geometry.setAttribute("position", new BufferAttribute(vertices, 3));
		geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
	}

	return geometry;
}

export function createRenderTarget(options: any = {}, activeRenderer = renderer) {
	if (!activeRenderer) {
		throw new Error("Renderer has not been initialized.");
	}

	const context = activeRenderer.getContext();
	const pixelRatio = activeRenderer.getPixelRatio();
	const width = Math.floor(context.canvas.width / pixelRatio) || 1;
	const height = Math.floor(context.canvas.height / pixelRatio) || 1;

	return new WebGLRenderTarget(width, height, options);
}

export function clearRenderTarget(target) {
	renderer.setRenderTarget(target);
	renderer.clear();
}
