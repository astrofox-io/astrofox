import fragmentShader from "@/shaders/glsl/fragment/ripple.glsl";
import vertexShader from "@/shaders/glsl/vertex/ripple.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		time: { type: "f", value: 0.0 },
		size: { type: "f", value: 0.0 },
		depth: { type: "f", value: 0.0 },
	},
	vertexShader,
	fragmentShader,
};
