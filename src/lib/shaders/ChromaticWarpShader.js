import fragmentShader from "@/lib/shaders/glsl/fragment/chromatic-warp.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		warp: { type: "f", value: 0.3 },
		chromatic: { type: "f", value: 0.5 },
	},
	vertexShader,
	fragmentShader,
};
