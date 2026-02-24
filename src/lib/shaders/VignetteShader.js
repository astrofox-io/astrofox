import fragmentShader from "@/lib/shaders/glsl/fragment/vignette.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		intensity: { type: "f", value: 1.0 },
		radius: { type: "f", value: 0.75 },
		softness: { type: "f", value: 0.45 },
	},
	vertexShader,
	fragmentShader,
};
