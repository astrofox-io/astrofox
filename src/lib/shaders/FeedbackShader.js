import fragmentShader from "@/lib/shaders/glsl/fragment/feedback.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		feedbackTexture: { type: "t", value: null },
		decay: { type: "f", value: 0.85 },
		zoom: { type: "f", value: 1.0 },
	},
	vertexShader,
	fragmentShader,
};
