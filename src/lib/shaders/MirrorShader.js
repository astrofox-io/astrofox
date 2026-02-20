import fragmentShader from "@/lib/shaders/glsl/fragment/mirror.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		side: { type: "i", value: 1 },
	},
	vertexShader,
	fragmentShader,
};
