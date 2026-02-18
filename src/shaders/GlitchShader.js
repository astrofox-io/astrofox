import fragmentShader from "@/shaders/glsl/fragment/glitch.glsl";
import vertexShader from "@/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		displacementTexture: { type: "t", value: null },
		shift: { type: "f", value: 0.08 },
		angle: { type: "f", value: 0.02 },
		seed: { type: "f", value: 0.02 },
		seed_x: { type: "f", value: 0.02 }, // -1,1
		seed_y: { type: "f", value: 0.02 }, // -1,1
		distortion_x: { type: "f", value: 0.5 },
		distortion_y: { type: "f", value: 0.6 },
		col_s: { type: "f", value: 0.05 },
		horizontal: { type: "i", value: 1 },
		vertical: { type: "i", value: 0 },
	},
	vertexShader,
	fragmentShader,
};
