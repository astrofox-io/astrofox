import fragmentShader from "@/lib/shaders/glsl/fragment/hue-shift.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		hue: { type: "f", value: 0.0 },
		saturation: { type: "f", value: 1.0 },
	},
	vertexShader,
	fragmentShader,
};
