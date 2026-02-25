// @ts-nocheck
import { ShaderMaterial, UniformsUtils } from "three";
import Pass from "./Pass";

export default class ShaderPass extends Pass {
	[key: string]: any;
	constructor(shader) {
		super();

		const { uniforms = {}, defines = {}, ...props } = shader;

		this.material = new ShaderMaterial({
			...props,
			uniforms: UniformsUtils.clone(uniforms),
			defines: { ...defines },
		});

		this.setFullscreen(this.material);

		this.needsSwap = true;
	}

	setUniforms(properties: any = {}) {
		const { uniforms } = this.material;

		for (const [key, value] of Object.entries(properties)) {
			if (uniforms[key] !== undefined) {
				const item = uniforms[key].value;

				if (item?.set) {
					item.set(...value);
				} else {
					uniforms[key].value = value;
				}
			}
		}
	}

	setSize(width, height) {
		this.setUniforms({ resolution: [width, height] });
	}

	render(renderer, inputBuffer, outputBuffer) {
		const { scene, camera, material } = this;

		if (inputBuffer && material.uniforms.inputTexture) {
			material.uniforms.inputTexture.value = inputBuffer.texture;
		}

		super.render(renderer, scene, camera, outputBuffer);
	}
}
