// @ts-nocheck
import {
	BufferAttribute,
	BufferGeometry,
	HalfFloatType,
	LinearFilter,
	RGBAFormat,
	WebGLRenderTarget,
} from "three";

let fullscreenGeometry = null;

export function getFullscreenGeometry() {
	if (!fullscreenGeometry) {
		const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
		const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

		fullscreenGeometry = new BufferGeometry();
		fullscreenGeometry.setAttribute(
			"position",
			new BufferAttribute(vertices, 3),
		);
		fullscreenGeometry.setAttribute("uv", new BufferAttribute(uvs, 2));
	}

	return fullscreenGeometry;
}

export function createRenderTarget(width, height) {
	return new WebGLRenderTarget(width, height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat,
		type: HalfFloatType,
	});
}
