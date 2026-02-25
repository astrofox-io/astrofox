import fragmentShader from "@/lib/shaders/glsl/fragment/shockwave.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		time: { type: "f", value: 0.0 },
		amplitude: { type: "f", value: 0.5 },
		frequency: { type: "f", value: 5.0 },
		speed: { type: "f", value: 0.5 },
	},
	vertexShader,
	fragmentShader,
};
