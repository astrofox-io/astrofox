import fragmentShader from "shaders/glsl/fragment/rgb-shift.glsl";
import vertexShader from "shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		amount: { type: "f", value: 0.005 },
		angle: { type: "f", value: 0.0 },
	},
	vertexShader,
	fragmentShader,
};
