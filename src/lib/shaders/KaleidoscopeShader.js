import fragmentShader from "@/lib/shaders/glsl/fragment/kaleidoscope.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		sides: { type: "f", value: 0 },
		angle: { type: "f", value: 0 },
	},
	vertexShader,
	fragmentShader,
};
