import fragmentShader from "shaders/glsl/fragment/lens-blur.glsl";
import vertexShader from "shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		extraBuffer: { type: "t", value: null },
		delta0: { type: "v2", value: new Vector2(1, 1) },
		delta1: { type: "v2", value: new Vector2(1, 1) },
		power: { type: "f", value: 1.0 },
		pass: { type: "i", value: 0 },
	},
	vertexShader,
	fragmentShader,
};
