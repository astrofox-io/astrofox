import fragmentShader from "@/lib/shaders/glsl/fragment/color-shift.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		time: { type: "f", value: 1.0 },
	},
	vertexShader,
	fragmentShader,
};
