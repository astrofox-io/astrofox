import fragmentShader from "shaders/glsl/fragment/triangle-blur.glsl";
import vertexShader from "shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		delta: { type: "v2", value: new Vector2(1, 1) },
	},
	vertexShader,
	fragmentShader,
};
