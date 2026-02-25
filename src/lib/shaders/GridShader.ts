import fragmentShader from "@/lib/shaders/glsl/fragment/grid.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
	},
	vertexShader,
	fragmentShader,
};
