import fragmentShader from "@/shaders/glsl/fragment/fxaa.glsl";
import vertexShader from "@/shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		resolution: { type: "v2", value: new Vector2(1, 1) },
	},
	vertexShader,
	fragmentShader,
};
