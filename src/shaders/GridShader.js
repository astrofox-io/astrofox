import fragmentShader from "shaders/glsl/fragment/grid.glsl";
import vertexShader from "shaders/glsl/vertex/basic.glsl";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
	},
	vertexShader,
	fragmentShader,
};
