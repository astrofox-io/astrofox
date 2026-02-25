import fragmentShader from "@/lib/shaders/glsl/fragment/film-grain.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		time: { type: "f", value: 0.0 },
		intensity: { type: "f", value: 0.5 },
		size: { type: "f", value: 512.0 },
		colored: { type: "i", value: 0 },
	},
	vertexShader,
	fragmentShader,
};
