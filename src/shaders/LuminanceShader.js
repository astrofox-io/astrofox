import fragmentShader from "shaders/glsl/fragment/luminance.glsl";
import vertexShader from "shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		amount: { type: "f", value: 0.0 },
	},
	vertexShader,
	fragmentShader,
};
