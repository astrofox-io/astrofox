import fragmentShader from "@/lib/shaders/glsl/fragment/heat-distortion.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		time: { type: "f", value: 0.0 },
		intensity: { type: "f", value: 0.5 },
		scale: { type: "f", value: 3.0 },
		speed: { type: "f", value: 0.5 },
	},
	vertexShader,
	fragmentShader,
};
